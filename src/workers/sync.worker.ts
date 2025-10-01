export interface SyncMessage {
  type: 'SYNC_DATA' | 'BROADCAST_UPDATE' | 'UPDATE_FROM_STORAGE';
  data?: any;
  key?: string;
}

export enum ResponseTypes {
  SYNC_RESPONE = 'SYNC_RESPONSE',
  DATA_UPDATED = 'DATA_UPDATE',
  RESULT = 'RESULT'
}

const sharedData: Record<string, any> = {};
self.onmessage = (e: MessageEvent<SyncMessage>) => {
  const { type, data, key } = e.data;
  switch (type) {
    case 'SYNC_DATA':
      if (key && sharedData[key]) {
        self.postMessage({
          type: ResponseTypes.SYNC_RESPONE,
          key,
          data: sharedData[key]
        })
      }
      break;
    
    case 'BROADCAST_UPDATE':
      if (key) {
        sharedData[key] = data;
        localStorage.setItem(key, JSON.stringify(data));
        broadcastToOtherTabs({type: 'UPDATE_FROM_STORAGE', key, data});
      }
      break;
    
    case 'UPDATE_FROM_STORAGE':
      if (key) {
        const stored = localStorage.getItem(key);
        if (stored) {
          sharedData[key] = JSON.parse(stored);
          self.postMessage({
            type: ResponseTypes.DATA_UPDATED,
            key,
            data: sharedData[key]
          });
        }
      }
      break;
  }
}

const broadcastChannelAvailable: boolean = typeof BroadcastChannel !== 'undefined';

const appSyncChannel: BroadcastChannel | undefined = (function() {
  if (broadcastChannelAvailable) {
    return new BroadcastChannel('app_sync')
  }
  return undefined;
}())

function broadcastToOtherTabs(message: SyncMessage): void {
  if (appSyncChannel) {
    appSyncChannel.postMessage(message)
  }
}

const messageHandler: (e: MessageEvent) => void = (e) => {
  const message = e.data as SyncMessage;
  if (message.type === 'UPDATE_FROM_STORAGE') {
    if (message.key) {
      sharedData[message.key] = message.data;
      self.postMessage({
        type: ResponseTypes.DATA_UPDATED,
        key: message.key,
        data: message.data
      });
    }
  }
}

if (appSyncChannel) {
  appSyncChannel.addEventListener('message', messageHandler)
}

export const appSyncChannelCleanup: () => void = () => {
  if (appSyncChannel) {
    appSyncChannel.removeEventListener('message', messageHandler);
    appSyncChannel.close();
  }
}

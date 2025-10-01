export interface WorkerMessage {
  type: 'PROCESS_DATA' | 'CLOSE';
  data?: any;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const {type, data} = e.data;
  if (type === 'PROCESS_DATA') {
    const res = processHeavyData(data);
    self.postMessage({ type: 'RESULT', data: res});
  } else if (type === 'CLOSE') {
    self.close();
  }
};

function processHeavyData(data: any): any {
  if (Array.isArray(data)) {
    return data.sort((a, b) => {
      return JSON.stringify(a).localeCompare(JSON.stringify(b));
    });
  }
  return data;
}


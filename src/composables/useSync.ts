import { onMounted, ref, watch } from "vue";
import { useWorker } from "./useWorker";
import type { SyncMessage } from "@/workers/sync.worker";

export function useSync(key: string) {
  const { 
    data,
    error,
    isLoading,
    initWorker,
    postMessage
  } = useWorker(new URL('../workers/sync.worker.ts', import.meta.url));
  const localData = ref<any>(null);
  const syncData = () => {
    postMessage({
      type: 'SYNC_DATA',
      key
    })
  }
  const updateData = (newData: any) => {
    localData.value = newData;
    postMessage({
      type: 'BROADCAST_UPDATE',
      key,
      data: newData
    } as SyncMessage)
  }
  onMounted(() => {
    initWorker();
    postMessage({
      type: 'UPDATE_FROM_STORAGE',
      key
    } as SyncMessage)
  })
  watch(
    data,
    (newData) => {
      if (newData) {
        localData.value = newData
      }
    }
  )
  return {
    data: localData,
    error,
    isLoading,
    syncData,
    updateData
  };
}
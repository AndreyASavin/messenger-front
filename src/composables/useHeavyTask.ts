import type { WorkerMessage } from "@/workers/heavy-task.worker";
import { useWorker } from "./useWorker";

export function useHeavyTask() {
  const { data, error, isLoading, initWorker, postMessage } = useWorker(new URL('../workers/heavy-task.worker.ts', import.meta.url));
  const processData = (dataToProcess: any) => {
    postMessage({
      data: dataToProcess,
      type: 'PROCESS_DATA'
    } as WorkerMessage)
  }
  return {
    result: data,
    error,
    isLoading,
    initWorker,
    processData
  }
}
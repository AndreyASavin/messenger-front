import type { WorkerMessage } from "@/workers/heavy-task.worker";
import { ResponseTypes, type SyncMessage } from "@/workers/sync.worker";
import { onUnmounted, ref } from "vue";

// function isResponseType(value:)

export function useWorker(workerUrl: string | URL) {
  const worker = ref<Worker | null>(null);
  const data = ref<any>(null);
  const error = ref<Error | null>(null);
  const isLoading = ref<boolean>(false);

  const initWorker = () => {
    isLoading.value = true;
    if (typeof Worker !== 'undefined') {
      worker.value = new Worker(workerUrl);
      worker.value.onmessage = (e: MessageEvent) => {
        const { type, data: resultData } = e.data;
        if (Object.values(ResponseTypes).includes(type)) {
          data.value = resultData;
          isLoading.value = false;
        }
      }
      worker.value.onerror = (err: ErrorEvent) => {
        error.value = err.error;
        isLoading.value = false;
      }
    } else {
      error.value = new Error('WebWorkers не поддерживаются');
    }
  }

  const postMessage = (message: SyncMessage | WorkerMessage) => {
    if (worker.value) {
      isLoading.value = true;
      worker.value.postMessage(message);
    }
  }

  const terminate = () => {
    if (worker.value) {
      worker.value.terminate();
      worker.value = null;
    }
  }

  onUnmounted(() => {
    terminate();
  })

  return {
    data, error, isLoading, initWorker, postMessage, terminate
  }
}
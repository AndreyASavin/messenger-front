export function createInlineWorker(workerFunction: Function): Worker {
  const blob: Blob = new Blob([`(${workerFunction.toString()})`], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

export function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined';
}

export function createWorkerWithFallback(workerUrl: string | URL, fallback: () => any): Worker | null {
  if (!isWorkerSupported()) {
    console.log('Web Worker не поддерживается, используется вспомогательная функция');
    fallback();
    return null;
  }
  try {
    return new Worker(workerUrl)
  } catch (err) {
    console.error(`Ошибка ${(err as Error).message} при поытке создания регистрации Worker`);
    fallback();
    return null;
  }
}
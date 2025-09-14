export const wait = (seconds: number): Promise<void> => new Promise(res => setTimeout(res, seconds * 1000));

export function randomUUID(): `${string}-${string}-${string}-${string}-${string}` {
  return crypto.randomUUID();
}

export function randomSimpleId(): string {
  return Math.random().toString(36).substring(2, 9);
}
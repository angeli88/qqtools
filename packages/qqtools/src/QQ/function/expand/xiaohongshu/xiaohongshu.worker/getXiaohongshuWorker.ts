export default function(): Worker {
  return new Worker(new URL('./xiaohongshu.worker.ts', import.meta.url));
}
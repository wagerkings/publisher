import { logger } from './logger.js';

type Task<T> = () => Promise<T>;

export async function processQueue<T>(tasks: Task<T>[], concurrency: number): Promise<T[]> {
  const results: (T | undefined)[] = new Array(tasks.length);
  let index = 0;

  async function worker(): Promise<void> {
    while (index < tasks.length) {
      const taskIndex = index++;
      if (taskIndex >= tasks.length) break;

      try {
        const result = await tasks[taskIndex]();
        results[taskIndex] = result;
      } catch (error) {
        logger.error({ error, taskIndex }, 'Task failed');
        // Error isolation: continue processing other tasks
      }
    }
  }

  const workers = Array(Math.min(concurrency, tasks.length)).fill(0).map(() => worker());
  await Promise.all(workers);

  return results.filter((r): r is T => r !== undefined);
}


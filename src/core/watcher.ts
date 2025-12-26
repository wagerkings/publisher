import chokidar, { type FSWatcher } from 'chokidar';
import { join } from 'path';
import { logger } from './logger.js';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];

function isImageFile(filePath: string): boolean {
  const ext = filePath.substring(filePath.lastIndexOf('.'));
  return IMAGE_EXTENSIONS.includes(ext);
}

export function watchModels(callback: (filePath: string, model: string) => void): FSWatcher {
  const modelsDir = join(process.cwd(), 'models');
  
  logger.info({ modelsDir }, 'Starting file watcher');

  const watcher = chokidar.watch('**/raw/**', {
    cwd: modelsDir,
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: false,
  });

  watcher.on('add', (relativePath: string) => {
    const fullPath = join(modelsDir, relativePath);
    if (isImageFile(fullPath)) {
      const model = relativePath.split('/')[0];
      logger.info({ file: fullPath, model }, 'New file detected');
      callback(fullPath, model);
    }
  });

  watcher.on('change', (relativePath: string) => {
    const fullPath = join(modelsDir, relativePath);
    if (isImageFile(fullPath)) {
      const model = relativePath.split('/')[0];
      logger.info({ file: fullPath, model }, 'File changed');
      callback(fullPath, model);
    }
  });

  watcher.on('error', (error) => {
    logger.error({ error }, 'Watcher error');
  });

  return watcher;
}

export function stopWatcher(watcher: FSWatcher): Promise<void> {
  return watcher.close();
}


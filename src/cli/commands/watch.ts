import { readdirSync } from 'fs';
import { join } from 'path';
import { watchModels, stopWatcher } from '../../core/watcher.js';
import { processFile } from '../../core/agent.js';
import { loadConfig } from '../../core/config.js';
import { logger } from '../../core/logger.js';
import { closeDb } from '../../core/manifest.js';
import { getModelRawPath } from '../../core/paths.js';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];

function isImageFile(filePath: string): boolean {
  const ext = filePath.substring(filePath.lastIndexOf('.'));
  return IMAGE_EXTENSIONS.includes(ext);
}

async function processExistingFiles(config: ReturnType<typeof loadConfig>): Promise<void> {
  const modelsDir = join(process.cwd(), 'models');
  
  try {
    const models = readdirSync(modelsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const model of models) {
      const rawPath = getModelRawPath(model);
      try {
        const files = readdirSync(rawPath, { withFileTypes: true })
          .filter(dirent => dirent.isFile())
          .map(dirent => join(rawPath, dirent.name))
          .filter(file => isImageFile(file));

        logger.info({ model, fileCount: files.length }, 'Processing existing files');

        for (const filePath of files) {
          try {
            await processFile(filePath, model, config);
          } catch (error) {
            logger.error({ error, file: filePath, model }, 'Failed to process existing file');
          }
        }
      } catch (error) {
        // Raw directory doesn't exist or isn't readable, skip
        continue;
      }
    }
  } catch (error) {
    logger.warn({ error }, 'Failed to scan for existing files');
  }
}

export async function watchCommand(_args: string[]): Promise<void> {
  const config = loadConfig();
  
  logger.info('Starting watch mode');

  // Process existing files first
  await processExistingFiles(config);

  const watcher = watchModels((filePath, model) => {
    processFile(filePath, model, config).catch((error) => {
      logger.error({ error, file: filePath, model }, 'Failed to process file in watch mode');
    });
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down...');
    await stopWatcher(watcher);
    closeDb();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep process alive
  process.stdin.resume();
}


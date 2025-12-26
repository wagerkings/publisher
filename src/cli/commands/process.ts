import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { processFile } from '../../core/agent.js';
import { loadConfig } from '../../core/config.js';
import { getModelRawPath } from '../../core/paths.js';
import { logger } from '../../core/logger.js';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];

function isImageFile(filePath: string): boolean {
  const ext = filePath.substring(filePath.lastIndexOf('.'));
  return IMAGE_EXTENSIONS.includes(ext);
}

function getAllImageFiles(model: string): string[] {
  const rawPath = getModelRawPath(model);
  const files: string[] = [];

  try {
    const entries = readdirSync(rawPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = join(rawPath, entry.name);
        if (isImageFile(filePath)) {
          files.push(filePath);
        }
      }
    }
  } catch (error) {
    throw new Error(`Failed to read directory ${rawPath}: ${error instanceof Error ? error.message : String(error)}`);
  }

  return files;
}

export async function processCommand(args: string[]): Promise<void> {
  const config = loadConfig();
  let model: string | null = null;
  let file: string | null = null;
  let all = false;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--model' && i + 1 < args.length) {
      model = args[i + 1];
      i++;
    } else if (args[i] === '--file' && i + 1 < args.length) {
      file = args[i + 1];
      i++;
    } else if (args[i] === '--all') {
      all = true;
    }
  }

  if (!model) {
    throw new Error('--model is required');
  }

  if (all && file) {
    throw new Error('Cannot use both --file and --all');
  }

  if (!all && !file) {
    throw new Error('Either --file or --all is required');
  }

  if (all) {
    const files = getAllImageFiles(model);
    logger.info({ model, fileCount: files.length }, 'Processing all files');
    
    for (const filePath of files) {
      try {
        await processFile(filePath, model, config);
      } catch (error) {
        logger.error({ error, file: filePath, model }, 'Failed to process file');
      }
    }
  } else if (file) {
    // Check if file exists
    try {
      statSync(file);
    } catch (error) {
      throw new Error(`File not found: ${file}`);
    }

    logger.info({ model, file }, 'Processing single file');
    await processFile(file, model, config);
  }
}


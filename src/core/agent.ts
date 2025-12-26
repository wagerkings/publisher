import { readFileSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { loadConfig, type PresetConfig } from './config.js';
import * as manifest from './manifest.js';
import { logger } from './logger.js';
import { exportImage } from '../processors/exporters.js';
import { processQueue } from './queue.js';

export interface ProcessingTask {
  social: string;
  type: string;
  preset: import('./config.js').Preset;
}

export async function processFile(filePath: string, model: string, config?: PresetConfig): Promise<void> {
  const cfg = config || loadConfig();
  
  try {
    // Compute source file hash
    const fileContent = readFileSync(filePath);
    const sourceHash = createHash('sha256').update(fileContent).digest('hex');
    const stats = statSync(filePath);
    const sourceMtime = stats.mtimeMs;

    // Check if file needs processing
    if (!manifest.hasHashChanged(filePath, sourceHash)) {
      logger.info({ file: filePath }, 'File unchanged, skipping');
      return;
    }

    logger.info({ file: filePath, model }, 'Processing file');

    // Derive tasks: all social × type combinations
    const tasks = deriveTasks(cfg);

    // Get or create file record (for fileId needed for outputs)
    const fileId = manifest.updateFile(filePath, sourceHash, sourceMtime, model, 'success');

    // Process all tasks
    let hasErrors = false;
    const processTasks = tasks.map((task) => async () => {
      try {
        const result = await exportImage(
          filePath,
          model,
          task.social,
          task.type,
          task.preset,
          cfg.processing.cropStrategy,
          cfg.processing.enableExifOrientation
        );

        // Record output in manifest
        manifest.recordOutput(fileId, task.social, task.type, result.outputPath, result.outputHash);

        logger.info(
          { file: filePath, social: task.social, type: task.type, output: result.outputPath },
          'Output created'
        );
      } catch (error) {
        logger.error({ error, file: filePath, social: task.social, type: task.type }, 'Failed to process task');
        hasErrors = true;
        throw error;
      }
    });

    await processQueue(processTasks, cfg.processing.concurrency);

    // Update file record with final status
    if (hasErrors) {
      manifest.updateFile(filePath, sourceHash, sourceMtime, model, 'error');
    }

    logger.info({ file: filePath, model }, 'File processing completed');
  } catch (error) {
    logger.error({ error, file: filePath, model }, 'Failed to process file');
    throw error;
  }
}

function deriveTasks(config: PresetConfig): ProcessingTask[] {
  const tasks: ProcessingTask[] = [];

  for (const [social, presets] of Object.entries(config.socials)) {
    for (const type of config.types) {
      const preset = presets[type as keyof typeof presets];
      if (preset) {
        tasks.push({ social, type, preset });
      }
    }
  }

  return tasks;
}


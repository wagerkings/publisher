import { join } from 'path';
import { mkdirSync } from 'fs';

export function getModelRawPath(model: string): string {
  return join(process.cwd(), 'models', model, 'raw');
}

export function getOutputPath(model: string, social: string, type: string, filename: string): string {
  return join(process.cwd(), 'models', model, social, type, filename);
}

export function getOutputDir(model: string, social: string, type: string): string {
  return join(process.cwd(), 'models', model, social, type);
}

export function ensureDirectoryExists(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true });
}

export function getManifestPath(): string {
  return join(process.cwd(), 'manifest.db');
}


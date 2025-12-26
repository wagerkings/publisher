import { readFileSync } from 'fs';
import { join } from 'path';

export interface Preset {
  width: number;
  height: number;
  fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  format: 'jpg' | 'jpeg' | 'png' | 'webp';
  quality?: number;
}

export interface SocialPresets {
  feed?: Preset;
  profile?: Preset;
  banner?: Preset;
}

export interface PresetConfig {
  types: string[];
  socials: Record<string, SocialPresets>;
  naming: {
    outputFilePattern: string;
  };
  processing: {
    concurrency: number;
    skipIfExistsAndSameHash: boolean;
    cropStrategy: string;
    enableExifOrientation: boolean;
  };
}

let cachedConfig: PresetConfig | null = null;

export function loadConfig(configPath?: string): PresetConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const path = configPath || join(process.cwd(), 'config', 'presets.json');
  let fileContent: string;

  try {
    fileContent = readFileSync(path, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read config file at ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }

  let config: unknown;
  try {
    config = JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Failed to parse config file: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!isValidConfig(config)) {
    throw new Error('Invalid config structure: missing required fields');
  }

  cachedConfig = config;
  return config;
}

function isValidConfig(config: unknown): config is PresetConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  const c = config as Record<string, unknown>;

  if (!Array.isArray(c.types) || c.types.length === 0) {
    return false;
  }

  if (typeof c.socials !== 'object' || c.socials === null) {
    return false;
  }

  if (typeof c.naming !== 'object' || c.naming === null) {
    return false;
  }

  if (typeof (c.naming as Record<string, unknown>).outputFilePattern !== 'string') {
    return false;
  }

  if (typeof c.processing !== 'object' || c.processing === null) {
    return false;
  }

  const proc = c.processing as Record<string, unknown>;
  if (
    typeof proc.concurrency !== 'number' ||
    typeof proc.skipIfExistsAndSameHash !== 'boolean' ||
    typeof proc.cropStrategy !== 'string' ||
    typeof proc.enableExifOrientation !== 'boolean'
  ) {
    return false;
  }

  return true;
}


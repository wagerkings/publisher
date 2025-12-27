import { readFileSync } from "fs";
import { join } from "path";

export interface Preset {
  width: number;
  height: number;
  fit: "cover" | "contain" | "fill" | "inside" | "outside";
  format: "jpg" | "jpeg" | "png" | "webp";
  quality?: number;
}

export interface SocialPresets {
  feed?: Preset;
  profile?: Preset;
  banner?: Preset;
}

export interface NoiseReductionConfig {
  enabled: boolean;
  sigma?: number;
}

export interface EnhancementSettings {
  // Basic adjustments (iPhone Photos-like)
  brightness?: number; // -1.0 to +1.0 (like iPhone Exposure, 0 = no change)
  contrast?: number; // 0.0 to 2.0 (1.0 = no change, >1.0 = more contrast)
  saturation?: number; // 0.0 to 2.0 (1.0 = no change, >1.0 = more saturated)
  sharpness?: number; // 0.0 to 3.0 (0 = no sharpening, higher = sharper)

  // Advanced adjustments
  shadows?: number; // -1.0 to +1.0 (lift shadows, 0 = no change)
  highlights?: number; // -1.0 to +1.0 (pull highlights, 0 = no change)
  blackPoint?: number; // 0.0 to 1.0 (adjust black level)
  gamma?: number; // 0.1 to 3.0 (1.0 = no change, >1.0 = brighter midtones)

  // Quality
  noiseReduction?: NoiseReductionConfig;
}

export interface EnhancementConfig {
  enabled: boolean;
  feed?: EnhancementSettings;
  profile?: EnhancementSettings;
  banner?: EnhancementSettings;
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
    enhancements?: EnhancementConfig;
  };
}

let cachedConfig: PresetConfig | null = null;

export function loadConfig(configPath?: string): PresetConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const path = configPath || join(process.cwd(), "config", "presets.json");
  let fileContent: string;

  try {
    fileContent = readFileSync(path, "utf-8");
  } catch (error) {
    throw new Error(
      `Failed to read config file at ${path}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  let config: unknown;
  try {
    config = JSON.parse(fileContent);
  } catch (error) {
    throw new Error(
      `Failed to parse config file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  if (!isValidConfig(config)) {
    throw new Error("Invalid config structure: missing required fields");
  }

  cachedConfig = config;
  return config;
}

function isValidConfig(config: unknown): config is PresetConfig {
  if (typeof config !== "object" || config === null) {
    return false;
  }

  const c = config as Record<string, unknown>;

  if (!Array.isArray(c.types) || c.types.length === 0) {
    return false;
  }

  if (typeof c.socials !== "object" || c.socials === null) {
    return false;
  }

  if (typeof c.naming !== "object" || c.naming === null) {
    return false;
  }

  if (
    typeof (c.naming as Record<string, unknown>).outputFilePattern !== "string"
  ) {
    return false;
  }

  if (typeof c.processing !== "object" || c.processing === null) {
    return false;
  }

  const proc = c.processing as Record<string, unknown>;
  if (
    typeof proc.concurrency !== "number" ||
    typeof proc.skipIfExistsAndSameHash !== "boolean" ||
    typeof proc.cropStrategy !== "string" ||
    typeof proc.enableExifOrientation !== "boolean"
  ) {
    return false;
  }

  // Validate enhancements config if present
  if (proc.enhancements !== undefined) {
    if (!isValidEnhancementConfig(proc.enhancements)) {
      return false;
    }
  }

  return true;
}

function isValidEnhancementConfig(
  config: unknown
): config is EnhancementConfig {
  if (typeof config !== "object" || config === null) {
    return false;
  }

  const enh = config as Record<string, unknown>;

  if (typeof enh.enabled !== "boolean") {
    return false;
  }

  // Validate type-specific settings if present
  const types = ["feed", "profile", "banner"];
  for (const type of types) {
    if (enh[type] !== undefined) {
      if (!isValidEnhancementSettings(enh[type])) {
        return false;
      }
    }
  }

  return true;
}

function isValidEnhancementSettings(
  settings: unknown
): settings is EnhancementSettings {
  if (typeof settings !== "object" || settings === null) {
    return false;
  }

  const s = settings as Record<string, unknown>;

  // All fields are optional, but if present must be correct type
  if (s.brightness !== undefined && typeof s.brightness !== "number") {
    return false;
  }
  if (s.contrast !== undefined && typeof s.contrast !== "number") {
    return false;
  }
  if (s.saturation !== undefined && typeof s.saturation !== "number") {
    return false;
  }
  if (s.sharpness !== undefined && typeof s.sharpness !== "number") {
    return false;
  }
  if (s.shadows !== undefined && typeof s.shadows !== "number") {
    return false;
  }
  if (s.highlights !== undefined && typeof s.highlights !== "number") {
    return false;
  }
  if (s.blackPoint !== undefined && typeof s.blackPoint !== "number") {
    return false;
  }
  if (s.gamma !== undefined && typeof s.gamma !== "number") {
    return false;
  }
  if (s.noiseReduction !== undefined) {
    if (typeof s.noiseReduction !== "object" || s.noiseReduction === null) {
      return false;
    }
    const nr = s.noiseReduction as Record<string, unknown>;
    if (typeof nr.enabled !== "boolean") {
      return false;
    }
    if (nr.sigma !== undefined && typeof nr.sigma !== "number") {
      return false;
    }
  }

  return true;
}

import { createHash } from "crypto";
import { writeFileSync } from "fs";
import { basename, extname } from "path";
import { EnhancementSettings, Preset } from "../core/config.js";
import {
  ensureDirectoryExists,
  getOutputDir,
  getOutputPath,
} from "../core/paths.js";
import { processImage } from "./imageProcessor.js";

export function computeHash8(buffer: Buffer): string {
  const hash = createHash("sha256").update(buffer).digest("hex");
  return hash.substring(0, 8);
}

export function generateOutputFilename(
  sourcePath: string,
  outputHash: string,
  format: string
): string {
  const base = basename(sourcePath, extname(sourcePath));
  return `${base}__${outputHash}.${format}`;
}

export async function exportImage(
  sourcePath: string,
  model: string,
  social: string,
  type: string,
  preset: Preset,
  cropStrategy: string,
  enableExifOrientation: boolean,
  enhancementSettings?: EnhancementSettings
): Promise<{ outputPath: string; outputHash: string }> {
  const processedBuffer = await processImage(
    sourcePath,
    preset,
    cropStrategy,
    enableExifOrientation,
    enhancementSettings
  );
  const outputHash = computeHash8(processedBuffer);

  const format = preset.format === "jpeg" ? "jpg" : preset.format;
  const filename = generateOutputFilename(sourcePath, outputHash, format);

  const outputDir = getOutputDir(model, social, type);
  ensureDirectoryExists(outputDir);

  const outputPath = getOutputPath(model, social, type, filename);
  writeFileSync(outputPath, processedBuffer);

  return { outputPath, outputHash };
}

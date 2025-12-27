import sharp from "sharp";
import { EnhancementSettings, Preset } from "../core/config.js";
import { getCropStrategy } from "./cropStrategies.js";
import { applyEnhancements } from "./enhancements.js";

export async function processImage(
  sourcePath: string,
  preset: Preset,
  cropStrategy: string,
  enableExifOrientation: boolean = true,
  enhancementSettings?: EnhancementSettings
): Promise<Buffer> {
  let pipeline = sharp(sourcePath);

  if (enableExifOrientation) {
    pipeline = pipeline.rotate();
  }

  // Apply enhancements before resize/crop
  if (enhancementSettings) {
    pipeline = applyEnhancements(pipeline, enhancementSettings, "");
  }

  const position = getCropStrategy(cropStrategy);

  pipeline = pipeline.resize(preset.width, preset.height, {
    fit: preset.fit,
    position: position,
  });

  switch (preset.format) {
    case "jpg":
    case "jpeg":
      return pipeline.jpeg({ quality: preset.quality || 85 }).toBuffer();
    case "png":
      return pipeline.png({ quality: preset.quality || 90 }).toBuffer();
    case "webp":
      return pipeline.webp({ quality: preset.quality || 85 }).toBuffer();
    default:
      return pipeline.jpeg({ quality: preset.quality || 85 }).toBuffer();
  }
}

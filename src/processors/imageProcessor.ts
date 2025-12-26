import sharp from 'sharp';
import { Preset } from '../core/config.js';
import { getCropStrategy } from './cropStrategies.js';

export async function processImage(
  sourcePath: string,
  preset: Preset,
  cropStrategy: string,
  enableExifOrientation: boolean = true
): Promise<Buffer> {
  let pipeline = sharp(sourcePath);

  if (enableExifOrientation) {
    pipeline = pipeline.rotate();
  }

  const position = getCropStrategy(cropStrategy);

  pipeline = pipeline.resize(preset.width, preset.height, {
    fit: preset.fit,
    position: position,
  });

  switch (preset.format) {
    case 'jpg':
    case 'jpeg':
      return pipeline.jpeg({ quality: preset.quality || 85 }).toBuffer();
    case 'png':
      return pipeline.png({ quality: preset.quality || 90 }).toBuffer();
    case 'webp':
      return pipeline.webp({ quality: preset.quality || 85 }).toBuffer();
    default:
      return pipeline.jpeg({ quality: preset.quality || 85 }).toBuffer();
  }
}


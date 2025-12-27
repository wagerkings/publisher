import sharp from "sharp";
import { EnhancementSettings } from "../core/config.js";

export function applyEnhancements(
  pipeline: sharp.Sharp,
  settings: EnhancementSettings,
  _imageType: string
): sharp.Sharp {
  let enhanced = pipeline;

  // Calculate final brightness adjustment (combining brightness, shadows, highlights)
  let finalBrightness = 1.0;

  if (settings.brightness !== undefined && settings.brightness !== 0) {
    // Convert from -1.0 to +1.0 range to Sharp's 0.0-2.0 range
    finalBrightness = 1.0 + settings.brightness;
  }

  // Shadows and highlights affect brightness curve
  // Shadows: lift dark areas (increase brightness)
  if (settings.shadows !== undefined && settings.shadows > 0) {
    finalBrightness += settings.shadows * 0.15;
  }
  // Highlights: pull bright areas (slight brightness reduction)
  if (settings.highlights !== undefined && settings.highlights < 0) {
    finalBrightness += settings.highlights * 0.05;
  }

  // Gamma adjustment (affects midtones, apply before other adjustments)
  if (settings.gamma !== undefined && settings.gamma !== 1.0) {
    enhanced = enhanced.gamma(settings.gamma);
  }

  // Contrast and black point adjustments (combine into single linear call to avoid compounding)
  let needsLinear = false;
  let contrastA = 1.0;
  let contrastB = 0.0;
  let blackPointB = 0.0;

  if (settings.contrast !== undefined && settings.contrast !== 1.0) {
    // Linear: output = input * a + b
    // For contrast: a = contrast, b = 0.5 * (1 - contrast)
    contrastA = settings.contrast;
    contrastB = 0.5 * (1 - settings.contrast);
    needsLinear = true;
  }

  if (settings.blackPoint !== undefined && settings.blackPoint !== 0) {
    blackPointB = settings.blackPoint;
    needsLinear = true;
  }

  // Apply combined linear transformation if needed
  if (needsLinear) {
    const a = contrastA;
    const b = contrastB + blackPointB;
    enhanced = enhanced.linear(a, b);
  }

  // Apply brightness/saturation via modulate (combine into single call)
  const modulateOptions: { brightness?: number; saturation?: number } = {};

  if (finalBrightness !== 1.0) {
    modulateOptions.brightness = Math.max(0.0, Math.min(2.0, finalBrightness));
  }

  if (settings.saturation !== undefined && settings.saturation !== 1.0) {
    modulateOptions.saturation = Math.max(
      0.0,
      Math.min(2.0, settings.saturation)
    );
  }

  if (
    modulateOptions.brightness !== undefined ||
    modulateOptions.saturation !== undefined
  ) {
    enhanced = enhanced.modulate(modulateOptions);
  }

  // Sharpness (apply after other adjustments)
  if (settings.sharpness !== undefined && settings.sharpness > 0) {
    const clampedSharpness = Math.min(3.0, Math.max(0.0, settings.sharpness));
    // Sharp's sharpen parameters
    enhanced = enhanced.sharpen({
      sigma: 1.0 + clampedSharpness * 0.3,
      m1: 1.0,
      m2: 2.0 + clampedSharpness,
      x1: 10,
      y2: 20,
      y3: 30,
    });
  }

  // Noise reduction (apply last, after sharpening)
  if (settings.noiseReduction?.enabled) {
    const sigma = settings.noiseReduction.sigma || 0.5;
    const clampedSigma = Math.max(0.3, Math.min(1.0, sigma));
    enhanced = enhanced.blur(clampedSigma);
  }

  return enhanced;
}

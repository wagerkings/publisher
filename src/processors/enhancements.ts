import sharp from "sharp";
import { EnhancementSettings } from "../core/config.js";

export function applyEnhancements(
  pipeline: sharp.Sharp,
  settings: EnhancementSettings,
  _imageType: string
): sharp.Sharp {
  let enhanced = pipeline;

  // Calculate combined brightness adjustment
  // We combine shadow lift, highlight pull, and midtone lift into a single brightness adjustment
  // This is a simplified approach - for more precise control, we'd need channel manipulation
  let combinedBrightness = 1.0;

  if (settings.liftShadows !== undefined && settings.liftShadows !== 1.0) {
    combinedBrightness *= settings.liftShadows;
  }

  if (
    settings.pullHighlights !== undefined &&
    settings.pullHighlights !== 1.0
  ) {
    // Highlight pull reduces brightness, so multiply by the pull value
    combinedBrightness *= settings.pullHighlights;
  }

  if (settings.liftMidtones !== undefined && settings.liftMidtones !== 1.0) {
    combinedBrightness *= settings.liftMidtones;
  }

  // Prepare modulate options
  const modulateOptions: { brightness?: number; saturation?: number } = {};

  if (combinedBrightness !== 1.0) {
    modulateOptions.brightness = combinedBrightness;
  }

  // Soften contrast by adjusting saturation
  // Lower saturation = softer contrast look
  if (
    settings.softenContrast !== undefined &&
    settings.softenContrast !== 1.0
  ) {
    modulateOptions.saturation = settings.softenContrast;
  }

  // Apply modulate if we have any adjustments
  if (
    modulateOptions.brightness !== undefined ||
    modulateOptions.saturation !== undefined
  ) {
    enhanced = enhanced.modulate(modulateOptions);
  }

  // Noise reduction (light blur)
  if (settings.noiseReduction?.enabled) {
    const sigma = settings.noiseReduction.sigma || 0.5;
    // Clamp sigma to reasonable range (0.3-1.0)
    const clampedSigma = Math.max(0.3, Math.min(1.0, sigma));
    enhanced = enhanced.blur(clampedSigma);
  }

  return enhanced;
}

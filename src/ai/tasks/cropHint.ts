// Crop hint stub - returns default behavior
import { getCropHint as routerGetCropHint } from '../aiRouter.js';

export async function getCropHint(imagePath: string): Promise<{ strategy: string }> {
  return routerGetCropHint(imagePath);
}


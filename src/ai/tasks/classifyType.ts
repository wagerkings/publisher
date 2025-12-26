// Type classification stub - returns default behavior
import { classifyType as routerClassifyType } from '../aiRouter.js';

export async function classifyType(imagePath: string): Promise<string[]> {
  return routerClassifyType(imagePath);
}


export type CropStrategy = 'center' | 'entropy' | 'attention' | 'faceAware';

export function getCropStrategy(strategy: CropStrategy | string): 'center' | 'entropy' | 'attention' {
  switch (strategy) {
    case 'center':
      return 'center';
    case 'entropy':
      return 'entropy';
    case 'attention':
      return 'attention';
    case 'faceAware':
      // Placeholder for future face-aware strategy
      // For now, return entropy as default
      return 'entropy';
    default:
      return 'entropy';
  }
}

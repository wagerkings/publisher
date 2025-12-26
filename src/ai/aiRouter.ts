// AI Router - Stub implementation
// Returns deterministic defaults. AI features disabled by default.

export function isAiEnabled(): boolean {
  return false;
}

export async function classifyType(_imagePath: string): Promise<string[]> {
  // Stub: returns all types (default behavior)
  return ['feed', 'profile', 'banner'];
}

export async function getCropHint(_imagePath: string): Promise<{ strategy: string }> {
  // Stub: returns entropy strategy (default)
  return { strategy: 'entropy' };
}


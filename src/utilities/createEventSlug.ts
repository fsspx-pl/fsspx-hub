import base62 from 'base62';

/**
 * Generate a base62 hash from a string
 */
function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Ensure positive number
  const positiveHash = Math.abs(hash);
  // Use base62 library and normalize to lowercase, limit to 8 chars
  return base62.encode(positiveHash).toLowerCase().substring(0, 8);
}

/**
 * Create an event slug in the format: baseSlug-base62hash
 * 
 * @param baseSlug - Base slug (already URL-friendly), e.g. "wizyta-duszpasterska"
 * @returns Slug in format: wizyta-duszpasterska-abc12345
 */
export function createEventSlug(baseSlug: string): string {
  const normalizedBase = (baseSlug || '').trim().toLowerCase();
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 10);
  const hashInput = `${normalizedBase}-${timestamp}-${random}`;
  const hash = generateHash(hashInput);

  if (!normalizedBase) {
    return `-${hash}`;
  }

  return `${normalizedBase}-${hash}`;
}


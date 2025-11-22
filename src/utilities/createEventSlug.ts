/**
 * Base62 encoding for generating short unique hashes
 */
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function base62Encode(num: number): string {
  if (num === 0) return '0';
  let result = '';
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

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
  return base62Encode(positiveHash).substring(0, 8).toLowerCase();
}

/**
 * Create a URL-friendly slug from event name
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Create an event slug in the format: name-base62hash
 * 
 * @param name - Event name (e.g., "Wizyta Duszpasterska")
 * @returns Slug in format: wizyta-duszpasterska-abc12345
 */
export function createEventSlug(name: string): string {
  const slugifiedName = slugify(name);
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 10);
  const hashInput = `${slugifiedName}-${timestamp}-${random}`;
  const hash = generateHash(hashInput);
  
  return `${slugifiedName}-${hash}`;
}


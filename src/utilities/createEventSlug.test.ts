import { createEventSlug } from './createEventSlug';

describe('createEventSlug', () => {
  it('should generate a slug with the correct format', () => {
    const baseSlug = 'wizyta-duszpasterska';
    const slug = createEventSlug(baseSlug);
    
    expect(slug).toMatch(/^wizyta-duszpasterska-[a-z0-9]+$/);
  });

  it('should generate unique slugs for the same input', () => {
    const baseSlug = 'test-event';
    const slug1 = createEventSlug(baseSlug);
    const slug2 = createEventSlug(baseSlug);
    
    // Slugs should be different due to timestamp/random component
    expect(slug1).not.toBe(slug2);
  });

  it('should handle empty strings', () => {
    const slug = createEventSlug('');
    
    expect(slug).toMatch(/^-[a-z0-9]+$/);
  });

  it('should lowercase the base62 hash', () => {
    const baseSlug = 'test-event';
    const slug = createEventSlug(baseSlug);
    const parts = slug.split('-');
    const hash = parts[parts.length - 1];
    
    // Hash should be lowercase (base62 can contain uppercase, but we lowercase it)
    expect(hash).toBe(hash.toLowerCase());
    expect(hash).toMatch(/^[a-z0-9]+$/);
  });
});


import { createEventSlug } from './createEventSlug';

describe('createEventSlug', () => {
  it('should generate a slug with the correct format', () => {
    const name = 'Wizyta Duszpasterska';
    const slug = createEventSlug(name);
    
    expect(slug).toMatch(/^wizyta-duszpasterska-[a-z0-9]+$/);
  });

  it('should handle special characters and diacritics', () => {
    const name = 'Wizyta Duszpasterska 2025!';
    const slug = createEventSlug(name);
    
    expect(slug).toMatch(/^wizyta-duszpasterska-[a-z0-9]+$/);
    expect(slug).not.toContain('!');
    expect(slug).not.toContain(' ');
    expect(slug).not.toContain('2025');
  });

  it('should not include year in slug', () => {
    const name = 'Test Event';
    const slug = createEventSlug(name);
    const currentYear = new Date().getFullYear();
    
    expect(slug).not.toContain(`-${currentYear}-`);
    expect(slug).not.toContain(`-${currentYear}`);
  });

  it('should generate unique slugs for the same input', () => {
    const name = 'Test Event';
    const slug1 = createEventSlug(name);
    const slug2 = createEventSlug(name);
    
    // Slugs should be different due to timestamp/random component
    expect(slug1).not.toBe(slug2);
  });

  it('should handle empty strings', () => {
    const slug = createEventSlug('');
    
    expect(slug).toMatch(/^-[a-z0-9]+$/);
  });

  it('should normalize Polish characters', () => {
    const name = 'Święto ąęłńóśćźż';
    const slug = createEventSlug(name);
    
    // Should remove diacritics
    expect(slug).not.toContain('ą');
    expect(slug).not.toContain('ę');
    expect(slug).not.toContain('ł');
  });

  it('should lowercase the base62 hash', () => {
    const name = 'Test Event';
    const slug = createEventSlug(name);
    const parts = slug.split('-');
    const hash = parts[parts.length - 1];
    
    // Hash should be lowercase (base62 can contain uppercase, but we lowercase it)
    expect(hash).toBe(hash.toLowerCase());
    expect(hash).toMatch(/^[a-z0-9]+$/);
  });
});


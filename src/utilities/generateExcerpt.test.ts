import { generateExcerpt } from './generateExcerpt';

describe('generateExcerpt', () => {
  it('should return empty string for null/undefined content', () => {
    expect(generateExcerpt(null)).toBe('');
    expect(generateExcerpt(undefined)).toBe('');
    expect(generateExcerpt({})).toBe('');
  });

  it('should return empty string for content without root.children', () => {
    const content = { root: {} };
    expect(generateExcerpt(content)).toBe('');
  });

  it('should extract text from simple text nodes', () => {
    const content = {
      root: {
        children: [
          { text: 'This is a simple announcement text.' }
        ]
      }
    };
    expect(generateExcerpt(content)).toBe('This is a simple announcement text.');
  });

  it('should extract text from multiple text nodes', () => {
    const content = {
      root: {
        children: [
          { text: 'First paragraph.' },
          { text: 'Second paragraph.' },
          { text: 'Third paragraph.' }
        ]
      }
    };
    expect(generateExcerpt(content)).toBe('First paragraph. Second paragraph. Third paragraph.');
  });

  it('should extract text from nested children', () => {
    const content = {
      root: {
        children: [
          {
            children: [
              { text: 'Nested text content.' }
            ]
          }
        ]
      }
    };
    expect(generateExcerpt(content)).toBe('Nested text content.');
  });

  it('should handle mixed content types', () => {
    const content = {
      root: {
        children: [
          { text: 'Start of content.' },
          {
            children: [
              { text: 'Nested content.' }
            ]
          },
          { text: 'End of content.' }
        ]
      }
    };
    expect(generateExcerpt(content)).toBe('Start of content. Nested content. End of content.');
  });

  it('should truncate text longer than max length', () => {
    const longText = 'This is a very long announcement text that should be truncated because it exceeds the maximum length allowed for excerpts.';
    const content = {
      root: {
        children: [
          { text: longText }
        ]
      }
    };
    const result = generateExcerpt(content, 50);
    expect(result.length).toBeLessThanOrEqual(53); // 50 + 3 for "..."
    expect(result).toMatch(/\.\.\.$/);
  });

  it('should break at word boundary when possible', () => {
    const longText = 'This is a very long announcement text that should be truncated at a word boundary.';
    const content = {
      root: {
        children: [
          { text: longText }
        ]
      }
    };
    const result = generateExcerpt(content, 30);
    // Truncates at 30 chars, no word boundary within 80% threshold, so cuts mid-word
    expect(result).toBe('This is a very long announceme...');
  });

  it('should not break at word boundary if too far back', () => {
    const longText = 'ThisIsAVeryLongWordWithoutSpacesThatCannotBeBrokenAtWordBoundary.';
    const content = {
      root: {
        children: [
          { text: longText }
        ]
      }
    };
    const result = generateExcerpt(content, 20);
    // No spaces, so truncates at exactly 20 chars
    expect(result).toBe('ThisIsAVeryLongWordW...');
  });

  it('should return full text if shorter than max length', () => {
    const shortText = 'Short announcement.';
    const content = {
      root: {
        children: [
          { text: shortText }
        ]
      }
    };
    expect(generateExcerpt(content, 50)).toBe(shortText);
  });

  it('should handle empty text nodes', () => {
    const content = {
      root: {
        children: [
          { text: '' },
          { text: 'Valid text.' },
          { text: '' }
        ]
      }
    };
    expect(generateExcerpt(content)).toBe('Valid text.');
  });

  it('should trim whitespace from result', () => {
    const content = {
      root: {
        children: [
          { text: '  Text with whitespace.  ' }
        ]
      }
    };
    expect(generateExcerpt(content)).toBe('Text with whitespace.');
  });

  it('should use default max length of 150', () => {
    const longText = 'A'.repeat(200);
    const content = {
      root: {
        children: [
          { text: longText }
        ]
      }
    };
    const result = generateExcerpt(content);
    expect(result.length).toBeLessThanOrEqual(153); // 150 + 3 for "..."
  });
}); 
import { extractMediaFromLexical } from './extractMediaFromLexical';

describe('extractMediaFromLexical', () => {
  it('should return empty array for null/undefined content', () => {
    expect(extractMediaFromLexical(null)).toEqual([]);
    expect(extractMediaFromLexical(undefined)).toEqual([]);
  });

  it('should return empty array for non-object content', () => {
    expect(extractMediaFromLexical('string')).toEqual([]);
    expect(extractMediaFromLexical(123)).toEqual([]);
    expect(extractMediaFromLexical([])).toEqual([]);
  });

  it('should return empty array for content without upload nodes', () => {
    const content = {
      root: {
        children: [
          { text: 'Some text content' },
          { type: 'paragraph', children: [{ text: 'More text' }] },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual([]);
  });

  it('should extract media ID from upload node with string value', () => {
    const content = {
      root: {
        children: [
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: 'media-id-123',
            },
          },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual(['media-id-123']);
  });

  it('should extract media ID from upload node with Media object value', () => {
    const content = {
      root: {
        children: [
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: {
                id: 'media-id-456',
                filename: 'document.pdf',
                url: '/api/media/file/document.pdf',
              },
            },
          },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual(['media-id-456']);
  });

  it('should extract media ID from upload node without fields (direct properties)', () => {
    const content = {
      root: {
        children: [
          {
            type: 'upload',
            relationTo: 'media',
            value: 'media-id-789',
          },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual(['media-id-789']);
  });

  it('should extract media ID from upload node using node.id as fallback', () => {
    const content = {
      root: {
        children: [
          {
            type: 'upload',
            id: 'media-id-fallback',
            relationTo: 'media',
          },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual(['media-id-fallback']);
  });

  it('should extract multiple media IDs from multiple upload nodes', () => {
    const content = {
      root: {
        children: [
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: 'media-id-1',
            },
          },
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: {
                id: 'media-id-2',
                filename: 'file2.pdf',
              },
            },
          },
          {
            type: 'upload',
            relationTo: 'media',
            value: 'media-id-3',
          },
        ],
      },
    };
    const result = extractMediaFromLexical(content);
    expect(result).toContain('media-id-1');
    expect(result).toContain('media-id-2');
    expect(result).toContain('media-id-3');
    expect(result.length).toBe(3);
  });

  it('should remove duplicate media IDs', () => {
    const content = {
      root: {
        children: [
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: 'media-id-duplicate',
            },
          },
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: 'media-id-duplicate',
            },
          },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual(['media-id-duplicate']);
  });

  it('should extract media IDs from nested children', () => {
    const content = {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'upload',
                fields: {
                  relationTo: 'media',
                  value: 'media-id-nested',
                },
              },
            ],
          },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual(['media-id-nested']);
  });

  it('should extract media IDs from deeply nested structures', () => {
    const content = {
      root: {
        children: [
          {
            type: 'list',
            children: [
              {
                type: 'listitem',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'upload',
                        fields: {
                          relationTo: 'media',
                          value: 'media-id-deep',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual(['media-id-deep']);
  });

  it('should handle upload nodes with nodeType instead of type', () => {
    const content = {
      root: {
        children: [
          {
            nodeType: 'upload',
            fields: {
              relationTo: 'media',
              value: 'media-id-nodetype',
            },
          },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual(['media-id-nodetype']);
  });

  it('should skip upload nodes with relationTo other than media', () => {
    const content = {
      root: {
        children: [
          {
            type: 'upload',
            fields: {
              relationTo: 'announcements',
              value: 'page-id-123',
            },
          },
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: 'media-id-123',
            },
          },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual(['media-id-123']);
  });

  it('should handle upload nodes without relationTo (defaults to media)', () => {
    const content = {
      root: {
        children: [
          {
            type: 'upload',
            fields: {
              value: 'media-id-no-relation',
            },
          },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual(['media-id-no-relation']);
  });

  it('should handle content without root property', () => {
    const content = {
      children: [
        {
          type: 'upload',
          fields: {
            relationTo: 'media',
            value: 'media-id-no-root',
          },
        },
      ],
    };
    expect(extractMediaFromLexical(content)).toEqual(['media-id-no-root']);
  });

  it('should handle circular references without infinite loops', () => {
    const node1: any = {
      type: 'upload',
      fields: {
        relationTo: 'media',
        value: 'media-id-1',
      },
    };
    const node2: any = {
      type: 'upload',
      fields: {
        relationTo: 'media',
        value: 'media-id-2',
      },
    };
    // Create circular reference
    node1.children = [node2];
    node2.children = [node1];

    const content = {
      root: {
        children: [node1],
      },
    };

    // Should not throw and should extract IDs
    const result = extractMediaFromLexical(content);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('media-id-1');
    expect(result).toContain('media-id-2');
  });

  it('should traverse alternative property names (nodes, content)', () => {
    const content = {
      root: {
        nodes: [
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: 'media-id-nodes',
            },
          },
        ],
        content: [
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: 'media-id-content',
            },
          },
        ],
      },
    };
    const result = extractMediaFromLexical(content);
    expect(result).toContain('media-id-nodes');
    expect(result).toContain('media-id-content');
    expect(result.length).toBe(2);
  });

  it('should handle mixed content with text and upload nodes', () => {
    const content = {
      root: {
        children: [
          { text: 'Some text before' },
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: 'media-id-mixed',
            },
          },
          { text: 'Some text after' },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual(['media-id-mixed']);
  });

  it('should skip upload nodes with invalid value types', () => {
    const content = {
      root: {
        children: [
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: null,
            },
          },
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: 123, // Invalid type
            },
          },
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: 'valid-media-id',
            },
          },
        ],
      },
    };
    expect(extractMediaFromLexical(content)).toEqual(['valid-media-id']);
  });

  it('should handle Media object without id property', () => {
    const content = {
      root: {
        children: [
          {
            type: 'upload',
            fields: {
              relationTo: 'media',
              value: {
                filename: 'file.pdf',
                // Missing id
              },
            },
          },
        ],
      },
    };
    // Should return empty since no valid ID can be extracted
    expect(extractMediaFromLexical(content)).toEqual([]);
  });
});

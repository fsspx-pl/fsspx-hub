/**
 * Extracts media IDs from Lexical editor content
 * Traverses the lexical JSON structure to find all upload nodes
 */

export function extractMediaFromLexical(content: any): string[] {
  if (!content || typeof content !== 'object') {
    return [];
  }

  const mediaIds: string[] = [];
  const visited = new Set();

  /**
   * Recursively traverse the lexical node structure
   */
  function traverseNode(node: any): void {
    if (!node || typeof node !== 'object') {
      return;
    }

    // Prevent infinite loops
    if (visited.has(node)) {
      return;
    }
    visited.add(node);

    // Check if this is an upload node
    // Lexical upload nodes typically have structure like:
    // { type: 'upload', fields: { relationTo: 'media', value: 'media-id' } }
    // or { type: 'upload', relationTo: 'media', value: 'media-id' }
    // With depth: 2, value can be a full Media object: { type: 'upload', relationTo: 'media', value: { id: '...', filename: '...', ... } }
    if (node.type === 'upload' || node.nodeType === 'upload') {
      const relationTo = node.fields?.relationTo || node.relationTo;
      const value = node.fields?.value || node.value;
      
      // Check if it's related to media collection
      if (relationTo === 'media' || !relationTo) {
        let mediaId: string | null = null;
        
        // Handle both string ID and full Media object
        if (value && typeof value === 'object' && 'id' in value) {
          // Full Media object (with depth: 2)
          mediaId = value.id as string;
        } else if (typeof value === 'string') {
          // String ID
          mediaId = value;
        } else if (node.id && typeof node.id === 'string') {
          // Fallback to node.id
          mediaId = node.id;
        }
        
        if (mediaId) {
          mediaIds.push(mediaId);
        }
      }
    }

    // Traverse children array
    if (Array.isArray(node.children)) {
      node.children.forEach((child: any) => traverseNode(child));
    }

    // Traverse other common properties that might contain nodes
    const propertiesToCheck = ['children', 'nodes', 'content', 'root'];
    for (const prop of propertiesToCheck) {
      if (Array.isArray(node[prop])) {
        node[prop].forEach((child: any) => traverseNode(child));
      } else if (node[prop] && typeof node[prop] === 'object') {
        traverseNode(node[prop]);
      }
    }
  }

  // Start traversal from root
  if (content.root) {
    traverseNode(content.root);
  } else {
    traverseNode(content);
  }

  // Remove duplicates
  return Array.from(new Set(mediaIds));
}

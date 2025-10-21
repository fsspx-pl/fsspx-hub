/**
 * Generates an excerpt from announcement content
 * @param content - The rich text content from PayloadCMS
 * @param maxLength - Maximum length of the excerpt (default: 150 characters)
 * @returns A plain text excerpt
 */
export const generateExcerpt = (content: any, maxLength: number = 150): string => {
  if (!content || !content.root || !content.root.children) {
    return '';
  }

  const extractText = (node: any): string => {
    if (typeof node === 'string') {
      return node;
    }
    
    if (node.text) {
      return node.text;
    }
    
    if (node.children && Array.isArray(node.children)) {
      return node.children.map(extractText).join(' ');
    }
    
    return '';
  };

  const fullText = content.root.children
    .map(extractText)
    .join(' ')
    .trim();

  if (fullText.length <= maxLength) {
    return fullText;
  }

  const truncated = fullText.substring(0, maxLength);
  
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}; 
import { NextFont } from "next/dist/compiled/@next/font";

/**
 * Transforms the first letter of the first paragraph in HTML content
 * to use the given NexFont font and larger size
 */
export function enhanceFirstLetterInContent(htmlContent: string, font: NextFont): string {
  // Look for the first paragraph with actual text content
  // This regex matches paragraph tags and captures their content
  const paragraphRegex = /<p(?:\s+[^>]*)?>(.*?)<\/p>/gs;
  let match;
  let firstTextParagraph = null;
  let firstTextParagraphContent = null;

  // Find the first paragraph that contains actual text
  while ((match = paragraphRegex.exec(htmlContent)) !== null) {
    const paragraphContent = match[1];
    // Simple check - if paragraph has content and doesn't start with a tag
    if (paragraphContent && paragraphContent.trim() &&
      !paragraphContent.trim().startsWith('<')) {
      firstTextParagraph = match[0];
      firstTextParagraphContent = paragraphContent;
      break;
    }
  }

  if (!firstTextParagraph || !firstTextParagraphContent) {
    return htmlContent;
  }

  // Find the first actual letter in the content
  const firstLetterMatch = firstTextParagraphContent.match(/[a-zA-Z]/);
  if (!firstLetterMatch) {
    return htmlContent;
  }

  const firstLetter = firstLetterMatch[0];
  const firstLetterIndex = firstTextParagraphContent.indexOf(firstLetter);

  // Find the first word (simplified approach)
  // Match text after the first letter until we hit a space, punctuation, or HTML tag
  const afterFirstLetterContent = firstTextParagraphContent.substring(firstLetterIndex + 1);
  const firstWordEndMatch = afterFirstLetterContent.match(/[ .,;:!?<]/);

  let restOfFirstWord = "";
  if (firstWordEndMatch) {
    restOfFirstWord = afterFirstLetterContent.substring(0, firstWordEndMatch.index);
  } else {
    // If no match, use all the remaining text as the word
    restOfFirstWord = afterFirstLetterContent;
  }

  // Calculate the position after the first word
  const afterFirstWordIndex = firstLetterIndex + 1 + (firstWordEndMatch && firstWordEndMatch.index !== undefined ? firstWordEndMatch.index : afterFirstLetterContent.length);

  // Break the paragraph content into parts
  const beforeLetter = firstTextParagraphContent.substring(0, firstLetterIndex);
  const afterFirstWord = firstTextParagraphContent.substring(afterFirstWordIndex);

  // Style the first letter with dramatically enhanced styling
  const styledFirstLetter = `<span class="${font.className}" style="
    font-size: 4.3rem; 
    float: left; 
    line-height: 0.8;
    margin-right: 0.1rem;
    margin-top: 0.1rem;
    text-transform: uppercase;
    font-weight: 600;
    color: #000;
  ">${firstLetter}</span>`;

  // Create the enhanced paragraph keeping the rest of the first word on the same line as the styled first letter
  const enhancedParagraph = `<p>${beforeLetter}${styledFirstLetter}${restOfFirstWord}${afterFirstWord}</p>`;

  // Replace the first text paragraph with our enhanced version
  return htmlContent.replace(firstTextParagraph, enhancedParagraph);
}

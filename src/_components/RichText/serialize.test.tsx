import React from 'react'
import { render } from '@testing-library/react'
import { serialize, serializeForEmail } from './serialize'

// Mock PageAttachments component
jest.mock('@/_components/PageAttachments', () => ({
  PageAttachments: ({ attachments }: { attachments: any }) => (
    <div data-testid="page-attachments" data-media-id={attachments?.id}>
      Attachment: {attachments?.filename}
    </div>
  ),
}))

describe('RichText serialize - Link handling', () => {
  const createLinkNode = (url: string, text: string, newTab?: boolean) => ({
    type: 'link',
    fields: {
      url,
      newTab,
    },
    children: [
      { text }
    ]
  })

  describe('serialize (web)', () => {
    it('should render links using CMSLink component', () => {
      const children = [createLinkNode('https://example.com', 'Click here')]
      const result = serialize(children)
      
      expect(result).not.toBeNull()
      expect(result).toHaveLength(1)
      
      // Render and check for CMSLink structure
      const { container } = render(<>{result}</>)
      
      // CMSLink wraps content in a div with specific classes
      const linkWrapper = container.querySelector('div.flex-row')
      expect(linkWrapper).toBeInTheDocument()
      
      // Should have Next.js Link component (rendered as <a> in test environment)
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://example.com')
    })

    it('should handle links with newTab option', () => {
      const children = [createLinkNode('https://example.com', 'Open in new tab', true)]
      const result = serialize(children)
      
      const { container } = render(<>{result}</>)
      const link = container.querySelector('a')
      
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should handle links without newTab option', () => {
      const children = [createLinkNode('https://example.com', 'Regular link', false)]
      const result = serialize(children)
      
      const { container } = render(<>{result}</>)
      const link = container.querySelector('a')
      
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('rel')
    })
  })

  describe('serializeForEmail', () => {
    it('should render links as plain <a> tags', () => {
      const children = [createLinkNode('https://example.com', 'Click here')]
      const result = serializeForEmail(children)
      
      expect(result).not.toBeNull()
      expect(result).toHaveLength(1)
      
      const { container } = render(<>{result}</>)
      
      // Should be a direct <a> tag, not wrapped in CMSLink div
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveStyle({ color: '#C81910', textDecoration: 'none' })
      
      // Should NOT have CMSLink wrapper
      const linkWrapper = container.querySelector('div.flex-row')
      expect(linkWrapper).not.toBeInTheDocument()
    })

    it('should handle links with newTab option in email', () => {
      const children = [createLinkNode('https://example.com', 'Open in new tab', true)]
      const result = serializeForEmail(children)
      
      const { container } = render(<>{result}</>)
      const link = container.querySelector('a')
      
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link).toHaveStyle({ color: '#C81910', textDecoration: 'none' })
    })

    it('should handle links without newTab option in email', () => {
      const children = [createLinkNode('https://example.com', 'Regular link', false)]
      const result = serializeForEmail(children)
      
      const { container } = render(<>{result}</>)
      const link = container.querySelector('a')
      
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('rel')
      expect(link).toHaveStyle({ color: '#C81910', textDecoration: 'none' })
    })

    it('should use # as fallback href when url is missing', () => {
      const children = [{
        type: 'link',
        fields: {
          url: null,
        },
        children: [
          { text: 'Link without URL' }
        ]
      }]
      const result = serializeForEmail(children)
      
      const { container } = render(<>{result}</>)
      const link = container.querySelector('a')
      
      expect(link).toHaveAttribute('href', '#')
    })
  })

  describe('Both serializers handle non-link nodes the same way', () => {
    const createTextNode = (text: string) => ({ text })
    
    const createParagraphNode = (text: string) => ({
      type: 'paragraph',
      children: [{ text }]
    })

    const createHeadingNode = (text: string, tag: string = 'h1') => ({
      type: 'heading',
      tag,
      children: [{ text }]
    })

    it('should handle text nodes identically', () => {
      const children = [createTextNode('Simple text')]
      
      const webResult = serialize(children)
      const emailResult = serializeForEmail(children)
      
      const { container: webContainer } = render(<>{webResult}</>)
      const { container: emailContainer } = render(<>{emailResult}</>)
      
      expect(webContainer.textContent).toBe('Simple text')
      expect(emailContainer.textContent).toBe('Simple text')
    })

    it('should handle paragraph nodes identically', () => {
      const children = [createParagraphNode('Paragraph text')]
      
      const webResult = serialize(children)
      const emailResult = serializeForEmail(children)
      
      const { container: webContainer } = render(<>{webResult}</>)
      const { container: emailContainer } = render(<>{emailResult}</>)
      
      // Both should render as <p> tags (via default case wrapping)
      expect(webContainer.textContent).toBe('Paragraph text')
      expect(emailContainer.textContent).toBe('Paragraph text')
    })

    it('should handle heading nodes identically', () => {
      const children = [createHeadingNode('Heading text', 'h2')]
      
      const webResult = serialize(children)
      const emailResult = serializeForEmail(children)
      
      const { container: webContainer } = render(<>{webResult}</>)
      const { container: emailContainer } = render(<>{emailResult}</>)
      
      const webHeading = webContainer.querySelector('h2')
      const emailHeading = emailContainer.querySelector('h2')
      
      expect(webHeading).toBeInTheDocument()
      expect(emailHeading).toBeInTheDocument()
      expect(webHeading?.textContent).toBe('Heading text')
      expect(emailHeading?.textContent).toBe('Heading text')
    })

    it('should handle mixed content with links differently', () => {
      const children = [
        createTextNode('Before link. '),
        createLinkNode('https://example.com', 'Click here'),
        createTextNode(' After link.')
      ]
      
      const webResult = serialize(children)
      const emailResult = serializeForEmail(children)
      
      const { container: webContainer } = render(<>{webResult}</>)
      const { container: emailContainer } = render(<>{emailResult}</>)
      
      // Both should have the same text content
      expect(webContainer.textContent).toContain('Before link. Click here After link.')
      expect(emailContainer.textContent).toContain('Before link. Click here After link.')
      
      // But web should have CMSLink wrapper, email should have plain <a>
      const webLinkWrapper = webContainer.querySelector('div.flex-row')
      const emailLinkWrapper = emailContainer.querySelector('div.flex-row')
      
      expect(webLinkWrapper).toBeInTheDocument()
      expect(emailLinkWrapper).not.toBeInTheDocument()
      
      // Both should have <a> tags
      const webLink = webContainer.querySelector('a')
      const emailLink = emailContainer.querySelector('a')
      
      expect(webLink).toBeInTheDocument()
      expect(emailLink).toBeInTheDocument()
      expect(emailLink).toHaveStyle({ color: '#C81910' })
    })
  })
})

describe('RichText serialize - Attachment handling', () => {
  const createUploadNode = (mediaId: string, filename: string) => ({
    type: 'upload',
    fields: {
      relationTo: 'media',
      value: {
        id: mediaId,
        filename,
        url: `/media/\${filename}`,
      },
    },
  })

  const createParagraphNode = (text: string) => ({
    type: 'paragraph',
    children: [{ text }],
  })

  describe('serialize (web)', () => {
    it('should render upload nodes as PageAttachments when hideAttachments is false', () => {
      const children = [createUploadNode('media-123', 'document.pdf')]
      const result = serialize(children, false)

      const { getByTestId } = render(<>{result}</>)
      
      const attachment = getByTestId('page-attachments')
      expect(attachment).toBeInTheDocument()
      expect(attachment).toHaveAttribute('data-media-id', 'media-123')
      expect(attachment).toHaveTextContent('document.pdf')
    })

    it('should render upload nodes as PageAttachments when hideAttachments is undefined', () => {
      const children = [createUploadNode('media-456', 'image.png')]
      const result = serialize(children)

      const { getByTestId } = render(<>{result}</>)
      
      const attachment = getByTestId('page-attachments')
      expect(attachment).toBeInTheDocument()
      expect(attachment).toHaveTextContent('image.png')
    })

    it('should hide upload nodes when hideAttachments is true', () => {
      const children = [createUploadNode('media-789', 'hidden.pdf')]
      const result = serialize(children, true)

      const { queryByTestId } = render(<>{result}</>)
      
      const attachment = queryByTestId('page-attachments')
      expect(attachment).not.toBeInTheDocument()
    })


    it('should show attachments in mixed content when hideAttachments is false', () => {
      const children = [
        createParagraphNode('Before attachment'),
        createUploadNode('media-abc', 'file.pdf'),
        createParagraphNode('After attachment'),
      ]

      const result = serialize(children, false)
      const { container, getByTestId } = render(<>{result}</>)
      expect(container.textContent).toContain('Before attachment')
      expect(container.textContent).toContain('After attachment')
      expect(getByTestId('page-attachments')).toBeInTheDocument()
    })

    it('should hide attachments in mixed content when hideAttachments is true', () => {
      const children = [
        createParagraphNode('Before attachment'),
        createUploadNode('media-abc', 'file.pdf'),
        createParagraphNode('After attachment'),
      ]

      const result = serialize(children, true)
      const { container, queryByTestId } = render(<>{result}</>)
      expect(container.textContent).toContain('Before attachment')
      expect(container.textContent).toContain('After attachment')
      expect(queryByTestId('page-attachments')).not.toBeInTheDocument()
    })

    it('should handle upload nodes without populated media value', () => {
      const children = [{
        type: 'upload',
        fields: {
          relationTo: 'media',
          value: 'just-an-id-string',
        },
      }]
      const result = serialize(children, false)

      const { queryByTestId } = render(<>{result}</>)
      
      // Should not render when value is just a string ID
      const attachment = queryByTestId('page-attachments')
      expect(attachment).not.toBeInTheDocument()
    })
  })

  describe('serializeForEmail', () => {
    it('should hide attachments by default', () => {
      const children = [createUploadNode('media-email', 'email-attachment.pdf')]
      const result = serializeForEmail(children)

      const { queryByTestId } = render(<>{result}</>)
      
      const attachment = queryByTestId('page-attachments')
      expect(attachment).not.toBeInTheDocument()
    })

    it('should hide attachments when hideAttachments is explicitly true', () => {
      const children = [createUploadNode('media-email', 'email-attachment.pdf')]
      const result = serializeForEmail(children, true)

      const { queryByTestId } = render(<>{result}</>)
      
      const attachment = queryByTestId('page-attachments')
      expect(attachment).not.toBeInTheDocument()
    })

    it('should show attachments when hideAttachments is explicitly false', () => {
      const children = [createUploadNode('media-email', 'email-attachment.pdf')]
      const result = serializeForEmail(children, false)

      const { getByTestId } = render(<>{result}</>)
      
      const attachment = getByTestId('page-attachments')
      expect(attachment).toBeInTheDocument()
    })

    it('should handle mixed content in email with hidden attachments', () => {
      const children = [
        createParagraphNode('Email content start'),
        createUploadNode('media-inline', 'inline-file.pdf'),
        createParagraphNode('Email content end'),
      ]
      const result = serializeForEmail(children)

      const { container, queryByTestId } = render(<>{result}</>)
      
      expect(container.textContent).toContain('Email content start')
      expect(container.textContent).toContain('Email content end')
      expect(queryByTestId('page-attachments')).not.toBeInTheDocument()
    })
  })
})

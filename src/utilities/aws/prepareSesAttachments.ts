import mimeTypes from 'mime-types';

/**
 * Prepare email attachments for AWS SES v2 SendEmailCommand
 * Filters out invalid attachments and converts them to the format expected by AWS SES
 */

export type EmailAttachmentInput = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type AwsSesAttachment = {
  FileName: string;
  RawContent: Buffer | string;
  ContentType: string;
  ContentDisposition: 'ATTACHMENT';
  ContentTransferEncoding: 'BASE64';
};

/**
 * Prepare attachments for AWS SES v2
 * @param attachments - Array of attachment objects with filename, content, and contentType
 * @returns Array of AWS SES attachment objects, or undefined if no valid attachments
 */
export function prepareAwsSesAttachments(
  attachments?: EmailAttachmentInput[]
): AwsSesAttachment[] | undefined {
  if (!attachments || attachments.length === 0) {
    return undefined;
  }

  const validAttachments = attachments.filter(
    att => att.filename && att.filename.trim().length > 0
  );

  if (validAttachments.length !== attachments.length) {
    console.warn(
      `Filtered out ${attachments.length - validAttachments.length} attachment(s) with invalid filenames`
    );
  }

  if (validAttachments.length === 0) {
    return undefined;
  }

  const preparedAttachments = validAttachments.map((att, index) => {
    const filename = att.filename?.trim();
    if (!filename || filename.length === 0) {
      throw new Error(
        `Attachment at index ${index} has invalid filename: ${JSON.stringify({
          filename: att.filename,
          hasContent: !!att.content,
        })}`
      );
    }

    // Pass Buffer directly - AWS SDK will handle base64 encoding
    // If SerializationException occurs, we'll fall back to base64 string
    return {
      FileName: filename,
      RawContent: att.content, // Pass Buffer directly
      ContentType: att.contentType || mimeTypes.lookup(filename) || 'application/octet-stream',
      ContentDisposition: 'ATTACHMENT' as const,
      ContentTransferEncoding: 'BASE64' as const,
    };
  });

  console.info(
    `Prepared ${preparedAttachments.length} attachment(s) for bulk email:`,
    preparedAttachments.map(att => ({
      FileName: att.FileName,
      ContentType: att.ContentType,
      RawContentLength: Buffer.isBuffer(att.RawContent) 
        ? att.RawContent.length 
        : Buffer.from(att.RawContent, 'base64').length,
    }))
  );

  return preparedAttachments;
}

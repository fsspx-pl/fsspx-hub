import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

if (!process.env.AWS_S3_BUCKET) {
  console.error('AWS_S3_BUCKET environment variable is not set');
}
if (!process.env.AWS_S3_REGION) {
  console.error('AWS_S3_REGION environment variable is not set');
}
if (!process.env.AWS_S3_ACCESS_KEY_ID) {
  console.error('AWS_S3_ACCESS_KEY_ID environment variable is not set');
}
if (!process.env.AWS_S3_SECRET_ACCESS_KEY) {
  console.error('AWS_S3_SECRET_ACCESS_KEY environment variable is not set');
}

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
  },
});

/**
 * Download a file from S3 and return it as a buffer
 * @param key - S3 object key (e.g., 'media/filename.pdf')
 * @returns Buffer containing the file content
 */
export async function downloadFileFromS3(key: string): Promise<Buffer> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error(`File not found in S3: ${key}`);
    }

    // Convert stream to buffer
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error(`Failed to download file from S3: ${key}`, error);
    throw new Error(
      `Failed to download file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Convert a PayloadCMS Media document to an email attachment format
 * Downloads the file from S3 and returns it in the format expected by email services
 * @param media - PayloadCMS Media document (can be string ID or populated object)
 * @returns Email attachment object with filename, content, and contentType
 */
export async function getMediaAsEmailAttachment(media: {
  id: string;
  filename?: string | null;
  url?: string | null;
  mimeType?: string | null;
  prefix?: string | null;
}): Promise<{
  filename: string;
  content: Buffer;
  contentType?: string;
}> {
  if (!media.filename) {
    throw new Error(`Media document ${media.id} has no filename`);
  }

  // Use prefix from Media document, fallback to 'media' for backward compatibility
  const prefix = media.prefix || 'media';
  const s3Key = `${prefix}/${media.filename}`;

  const buffer = await downloadFileFromS3(s3Key);

  return {
    filename: media.filename,
    content: buffer,
    contentType: media.mimeType || 'application/pdf',
  };
}

/**
 * Convert attachment objects to email attachment format
 * Used by email sending functions (Nodemailer, AWS SES)
 * @param attachments - Array of attachment objects with filename, content, and contentType
 * @returns Array of email attachment objects
 */
export function formatAttachmentsForEmail(
  attachments: Array<{ filename: string; content: Buffer; contentType?: string }>
): Array<{ filename: string; content: Buffer; contentType?: string }> {
  return attachments.map(att => ({
    filename: att.filename,
    content: att.content,
    contentType: att.contentType,
  }));
}

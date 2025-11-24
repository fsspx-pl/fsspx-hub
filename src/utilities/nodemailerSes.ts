import nodemailer from 'nodemailer';
import { personalizeUnsubscribeUrl } from './personalizeUnsubscribe';

// Note: Using console for now as these utilities don't have access to payload instance
// In production, consider passing logger from the calling context

if (!process.env.AWS_REGION) {
  console.error('AWS_REGION environment variable is not set');
}
if (!process.env.AWS_ACCESS_KEY_ID) {
  console.error('AWS_ACCESS_KEY_ID environment variable is not set');
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('AWS_SECRET_ACCESS_KEY environment variable is not set');
}
if (!process.env.SMTP_HOST) {
  console.error('SMTP_HOST environment variable is not set');
}
if (!process.env.SMTP_PORT) {
  console.error('SMTP_PORT environment variable is not set');
}
if (!process.env.SMTP_USER) {
  console.error('SMTP_USER environment variable is not set');
}
if (!process.env.SMTP_PASS) {
  console.error('SMTP_PASS environment variable is not set');
}

// Create Nodemailer transporter for AWS SES
const createSESTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send a single email using AWS SES via Nodemailer
 */
export async function sendEmail(emailData: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: any[];
}) {
  try {
    console.info('Sending email via Nodemailer + AWS SES:', {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from || process.env.FROM_ADDRESS
    });

    const transporter = createSESTransporter();

    const mailOptions = {
      from: emailData.from || process.env.FROM_ADDRESS,
      to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      replyTo: emailData.replyTo,
      attachments: emailData.attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.info('Email sent successfully:', result.messageId);
    
    return {
      messageId: result.messageId,
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send bulk emails to multiple recipients
 * Note: In sandbox mode, recipients must be verified
 */
export async function sendBulkEmails(emailData: {
  recipients: string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  batchSize?: number;
}) {
  try {
    console.info('Sending bulk emails via Nodemailer + AWS SES:', {
      recipientCount: emailData.recipients.length,
      subject: emailData.subject,
      batchSize: emailData.batchSize || 10
    });

    const transporter = createSESTransporter();
    const batchSize = emailData.batchSize || 10;
    const results = {
      total: emailData.recipients.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process recipients in batches
    for (let i = 0; i < emailData.recipients.length; i += batchSize) {
      const batch = emailData.recipients.slice(i, i + batchSize);
      
      const mailOptions = {
        from: emailData.from || process.env.FROM_ADDRESS,
        to: batch.join(', '),
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        replyTo: emailData.replyTo,
      };

      try {
        const result = await transporter.sendMail(mailOptions);
        results.successful += batch.length;
        console.info(`Batch ${Math.floor(i / batchSize) + 1} sent successfully:`, result.messageId);
      } catch (error) {
        results.failed += batch.length;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${errorMsg}`);
        console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, errorMsg);
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < emailData.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.info('Bulk email sending completed:', results);
    return results;
  } catch (error) {
    console.error('Failed to send bulk emails:', error);
    throw new Error(`Bulk email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send newsletter to a list of recipients using Nodemailer
 * This function accepts a list of email addresses directly (from Payload)
 */
export async function sendNewsletterToRecipients(emailData: {
  recipients: string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  unsubscribeBaseUrl?: string;
  getSubscriptionId?: (email: string) => Promise<string | null>;
}) {
  try {
    console.info('Sending newsletter to recipients:', {
      recipientCount: emailData.recipients.length,
      subject: emailData.subject
    });

    if (emailData.recipients.length === 0) {
      console.warn('No recipients provided');
      return {
        total: 0,
        successful: 0,
        failed: 0,
        errors: ['No recipients provided']
      };
    }

    // Personalize HTML for each recipient with unsubscribe URL using subscription ID
    const personalizedEmails = await Promise.all(
      emailData.recipients.map(async (email) => ({
        email,
        html: await personalizeUnsubscribeUrl({
          html: emailData.html,
          email,
          unsubscribeBaseUrl: emailData.unsubscribeBaseUrl,
          getSubscriptionId: emailData.getSubscriptionId,
        }),
      }))
    );

    // Send emails individually with personalized content
    const results = await Promise.all(
      personalizedEmails.map(({ email, html }) =>
        sendEmail({
          to: email,
          subject: emailData.subject,
          html,
          text: emailData.text,
          from: emailData.from,
          replyTo: emailData.replyTo,
        }).catch((error) => {
          console.error(`Failed to send to ${email}:`, error);
          return { success: false, email, error: error instanceof Error ? error.message : 'Unknown error' };
        })
      )
    );

    const successful = results.filter(r => r && 'success' in r && r.success).length;
    const failed = results.length - successful;

    return {
      total: emailData.recipients.length,
      successful,
      failed,
      errors: results
        .filter(r => r && 'error' in r)
        .map(r => (r as any).error || 'Unknown error'),
    };

  } catch (error) {
    console.error('Failed to send newsletter to recipients:', error);
    throw new Error(`Newsletter sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send newsletter to contact list using Nodemailer
 * This function fetches contacts from SES and sends emails
 * @deprecated Use sendNewsletterToRecipients with Payload data instead
 */
export async function sendNewsletterToContactList(emailData: {
  contactListName: string;
  topicName?: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  unsubscribeBaseUrl?: string;
  getSubscriptionId?: (email: string) => Promise<string | null>;
}) {
  try {
    console.info('Sending newsletter to contact list:', {
      contactListName: emailData.contactListName,
      topicName: emailData.topicName,
      subject: emailData.subject
    });

    // Import SES client to get contacts
    const { SESv2Client, ListContactsCommand } = await import('@aws-sdk/client-sesv2');
    
    const sesClient = new SESv2Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Get contacts from the contact list
    const command = new ListContactsCommand({
      ContactListName: emailData.contactListName,
      Filter: emailData.topicName ? {
        FilteredStatus: 'OPT_IN',
        TopicFilter: {
          TopicName: emailData.topicName,
          UseDefaultIfPreferenceUnavailable: true
        }
      } : {
        FilteredStatus: 'OPT_IN'
      },
      PageSize: 1000
    });

    const response = await sesClient.send(command);
    const contacts = response.Contacts || [];
    
    if (contacts.length === 0) {
      console.warn('No contacts found in contact list');
      return {
        total: 0,
        successful: 0,
        failed: 0,
        errors: ['No contacts found in contact list']
      };
    }

    const recipients = contacts.map(contact => contact.EmailAddress).filter((email): email is string => Boolean(email));
    
    console.info(`Found ${recipients.length} contacts to send newsletter to`);

    // Personalize HTML for each recipient with unsubscribe URL using subscription ID
    const personalizedEmails = await Promise.all(
      recipients.map(async (email) => ({
        email,
        html: await personalizeUnsubscribeUrl({
          html: emailData.html,
          email,
          unsubscribeBaseUrl: emailData.unsubscribeBaseUrl,
          getSubscriptionId: emailData.getSubscriptionId,
        }),
      }))
    );

    // Send emails individually with personalized content
    const results = await Promise.all(
      personalizedEmails.map(({ email, html }) =>
        sendEmail({
          to: email,
          subject: emailData.subject,
          html,
          text: emailData.text,
          from: emailData.from,
          replyTo: emailData.replyTo,
        }).catch((error) => {
          console.error(`Failed to send to ${email}:`, error);
          return { success: false, email, error: error instanceof Error ? error.message : 'Unknown error' };
        })
      )
    );

    const successful = results.filter(r => r && 'success' in r && r.success).length;
    const failed = results.length - successful;

    return {
      total: recipients.length,
      successful,
      failed,
      errors: results
        .filter(r => r && 'error' in r)
        .map(r => (r as any).error || 'Unknown error'),
    };

  } catch (error) {
    console.error('Failed to send newsletter to contact list:', error);
    throw new Error(`Newsletter sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

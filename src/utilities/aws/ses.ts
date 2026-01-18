import { CreateContactCommand, SESv2Client, UpdateContactCommand } from '@aws-sdk/client-sesv2';
import { prepareAwsSesAttachments } from '@/utilities/aws/prepareSesAttachments';
import mimeTypes from 'mime-types';

if (!process.env.AWS_REGION) {
  console.error('AWS_REGION environment variable is not set');
}
if (!process.env.AWS_ACCESS_KEY_ID) {
  console.error('AWS_ACCESS_KEY_ID environment variable is not set');
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('AWS_SECRET_ACCESS_KEY environment variable is not set');
}
if (!process.env.FROM_ADDRESS) {
  console.error('FROM_ADDRESS environment variable is not set');
}

const sesClient = new SESv2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Send bulk email to a list of recipients using AWS SES
 * This function accepts a list of email addresses directly (from Payload)
 */
export async function sendBulkEmailToRecipients(emailData: {
  recipients: string[];
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  htmlContent: string;
  unsubscribeBaseUrl?: string;
  getSubscriptionId?: (email: string) => Promise<string | null>;
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
}) {
  try {
    console.info('Sending bulk email to recipients:', {
      subject: emailData.subject,
      fromName: emailData.fromName,
      recipientCount: emailData.recipients.length,
      attachmentCount: emailData.attachments?.length || 0,
      attachments: emailData.attachments?.map(att => ({
        filename: att.filename,
        contentType: att.contentType || mimeTypes.lookup(att.filename) || 'application/octet-stream',
        size: att.content.length
      })) || []
    });

    if (emailData.recipients.length === 0) {
      throw new Error('No recipients provided');
    }

    const { SESv2Client, SendEmailCommand } = await import('@aws-sdk/client-sesv2');
    
    const sesClient = new SESv2Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const results = {
      total: emailData.recipients.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    const preparedAttachments = prepareAwsSesAttachments(emailData.attachments);

    // Send emails in batches to respect rate limits
    const batchSize = 10;
    for (let i = 0; i < emailData.recipients.length; i += batchSize) {
      const batch = emailData.recipients.slice(i, i + batchSize);
      
      const sendPromises = batch.map(async (email) => {
        try {
          // Personalize unsubscribe URL for each recipient using subscription ID
          let personalizedHtml = emailData.htmlContent;
          if (emailData.unsubscribeBaseUrl && emailData.getSubscriptionId) {
            const subscriptionId = await emailData.getSubscriptionId(email);
            if (subscriptionId) {
              const unsubscribeUrl = `${emailData.unsubscribeBaseUrl}/${subscriptionId}`;
              personalizedHtml = personalizedHtml.replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);
            }
          }

          const emailContent: any = {
            Subject: {
              Data: emailData.subject,
              Charset: 'UTF-8',
            },
            Body: {
              Html: {
                Data: personalizedHtml,
                Charset: 'UTF-8',
              },
            },
          };

          if (preparedAttachments && preparedAttachments.length > 0) {
            emailContent.Attachments = preparedAttachments;
          }

          const sendCommand = new SendEmailCommand({
            Destination: {
              ToAddresses: [email],
            },
            Content: {
              Simple: emailContent,
            },
            FromEmailAddress: emailData.fromName,
            ReplyToAddresses: [emailData.replyTo],
          });

          let response;
          try {
            response = await sesClient.send(sendCommand);
          } catch (error: any) {
            // Handle known SerializationException bug when using Buffer for RawContent
            // Fall back to base64 string encoding
            if (error.name === 'SerializationException' && preparedAttachments && preparedAttachments.length > 0) {
              console.warn(`SerializationException for ${email}, retrying with base64 string encoding`);
              
              // Convert Buffer RawContent to base64 string
              const fallbackAttachments = preparedAttachments.map(att => ({
                ...att,
                RawContent: Buffer.isBuffer(att.RawContent) 
                  ? att.RawContent.toString('base64')
                  : att.RawContent,
              }));
              
              emailContent.Attachments = fallbackAttachments;
              
              const retryCommand = new SendEmailCommand({
                Destination: {
                  ToAddresses: [email],
                },
                Content: {
                  Simple: emailContent,
                },
                FromEmailAddress: emailData.fromName,
                ReplyToAddresses: [emailData.replyTo],
              });
              
              response = await sesClient.send(retryCommand);
            } else {
              throw error;
            }
          }
          
          results.successful++;
          console.info(`✅ Sent to ${email}: ${response.MessageId}`);
          return response.MessageId;
        } catch (error) {
          results.failed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`${email}: ${errorMsg}`);
          console.error(`❌ Failed to send to ${email}:`, errorMsg);
          return null;
        }
      });

      await Promise.all(sendPromises);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < emailData.recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.info('Bulk email sending completed:', results);
    
    return {
      messageId: `bulk-${Date.now()}`,
      data: results
    };
    
  } catch (error) {
    console.error('Failed to send bulk email:', error);
    throw new Error(`Bulk email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


/**
 * Check if a contact exists in AWS SES contact list
 */
export async function contactExistsInList(contactListName: string, email: string, topicName?: string): Promise<boolean> {
  try {
    const { GetContactCommand } = await import('@aws-sdk/client-sesv2');
    const command = new GetContactCommand({
      ContactListName: contactListName,
      EmailAddress: email,
    });

    const response = await sesClient.send(command);
    
    // If contact exists, check topic preference if topicName is provided
    if (topicName && response.TopicPreferences) {
      const hasTopic = response.TopicPreferences.some(
        topic => topic.TopicName === topicName && topic.SubscriptionStatus === 'OPT_IN'
      );
      return hasTopic;
    }
    
    // If no topic specified, just check if contact exists
    return !!response.EmailAddress;
  } catch (error) {
    // If contact doesn't exist, AWS SES throws an error
    if (error instanceof Error && (error.name === 'NotFoundException' || error.name === 'BadRequestException')) {
      return false;
    }
    // For other errors, log and return false
    console.error('Error checking contact existence:', error);
    return false;
  }
}

/**
 * Add a single contact to a contact list
 */
export async function addContactToList(contactListName: string, email: string, topicName: string, firstName?: string, lastName?: string) {
  try {
    console.info('Adding contact to list:', { contactListName, email, topicName });

    const command = new CreateContactCommand({
      ContactListName: contactListName,
      EmailAddress: email,
      UnsubscribeAll: false,
      TopicPreferences: [
        {
          TopicName: topicName,
          SubscriptionStatus: 'OPT_IN'
        }
      ],
      AttributesData: JSON.stringify({
        FirstName: firstName || '',
        LastName: lastName || '',
      }),
    });

    const response = await sesClient.send(command);
    console.info('Contact added successfully:', email);
    
    return {
      email,
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Failed to add contact:', error);
    throw new Error(`Contact addition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update a contact's topic preference to OPT_OUT
 * This unsubscribes them from a specific topic while keeping them in the contact list
 * (so they can remain subscribed to other topics)
 */
export async function unsubscribeFromTopic(contactListName: string, email: string, topicName: string) {
  try {
    console.info('Unsubscribing contact from topic:', { contactListName, email, topicName });

    // First, get the contact to preserve existing topic preferences
    const { GetContactCommand } = await import('@aws-sdk/client-sesv2');
    const getCommand = new GetContactCommand({
      ContactListName: contactListName,
      EmailAddress: email,
    });

    let existingTopicPreferences: Array<{ TopicName: string; SubscriptionStatus: 'OPT_IN' | 'OPT_OUT' }> = [];
    
    try {
      const contactResponse = await sesClient.send(getCommand);
      existingTopicPreferences = (contactResponse.TopicPreferences || []).map(topic => ({
        TopicName: topic.TopicName!,
        SubscriptionStatus: topic.SubscriptionStatus as 'OPT_IN' | 'OPT_OUT',
      }));
    } catch (error) {
      // If contact doesn't exist, that's okay - we'll just set this topic to OPT_OUT
      console.info('Contact not found, will create with OPT_OUT for this topic');
    }

    // Update topic preferences: set the specified topic to OPT_OUT, keep others as-is
    const updatedTopicPreferences = existingTopicPreferences
      .filter(topic => topic.TopicName !== topicName)
      .concat([{
        TopicName: topicName,
        SubscriptionStatus: 'OPT_OUT' as const,
      }]);

    const command = new UpdateContactCommand({
      ContactListName: contactListName,
      EmailAddress: email,
      TopicPreferences: updatedTopicPreferences,
      UnsubscribeAll: false, // Don't unsubscribe from all topics, just this one
    });

    const response = await sesClient.send(command);
    console.info('Contact unsubscribed from topic successfully:', { email, topicName });
    
    return {
      email,
      topicName,
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Failed to unsubscribe contact from topic:', error);
    // If contact doesn't exist, that's okay - consider it already unsubscribed
    if (error instanceof Error && (error.name === 'NotFoundException' || error.name === 'BadRequestException')) {
      console.info('Contact not found in SES, considering it already unsubscribed:', email);
      return {
        email,
        topicName,
        success: true,
        alreadyUnsubscribed: true
      };
    }
    throw new Error(`Topic unsubscribe failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

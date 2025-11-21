import { SESv2Client, SendBulkEmailCommand, GetContactListCommand, CreateContactListCommand, CreateContactCommand, ListContactsCommand, GetContactCommand, DeleteContactCommand, UpdateContactCommand, PutSuppressedDestinationCommand, GetSuppressedDestinationCommand, ListSuppressedDestinationsCommand } from '@aws-sdk/client-sesv2';

// Note: Using console for now as these utilities don't have access to payload instance
// In production, consider passing logger from the calling context

// Validate AWS configuration
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

// Initialize SES v2 client
const sesClient = new SESv2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Send bulk email to a contact list using AWS SES
 */
export async function sendBulkEmail(emailData: {
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  htmlContent: string;
  contactListName: string;
  topicName?: string;
  unsubscribeBaseUrl?: string;
  getSubscriptionId?: (email: string) => Promise<string | null>;
}) {
  try {
    console.info('Sending bulk email with data:', {
      subject: emailData.subject,
      fromName: emailData.fromName,
      contactListName: emailData.contactListName,
      topicName: emailData.topicName
    });

    // First, get the contacts from the contact list with topic filtering
    const { SESv2Client, ListContactsCommand } = await import('@aws-sdk/client-sesv2');
    
    const sesClient = new SESv2Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Get all contacts from the contact list first
    const listCommand = new ListContactsCommand({
      ContactListName: emailData.contactListName,
      Filter: {
        FilteredStatus: 'OPT_IN'
      },
      PageSize: 1000
    });

    const listResponse = await sesClient.send(listCommand);
    let contacts = listResponse.Contacts || [];
    
    // Filter by topic if specified
    if (emailData.topicName) {
      contacts = contacts.filter(contact => 
        contact.TopicPreferences?.some(topic => 
          topic.TopicName === emailData.topicName && topic.SubscriptionStatus === 'OPT_IN'
        )
      );
      console.info(`Filtered to ${contacts.length} contacts for topic: ${emailData.topicName}`);
    }
    
    if (contacts.length === 0) {
      throw new Error('No contacts found in contact list for the specified topic');
    }

    console.info(`Found ${contacts.length} contacts to send bulk email to`);

    // Use SendEmailCommand for each contact (AWS SES doesn't have true bulk sending to contact lists)
    const { SendEmailCommand } = await import('@aws-sdk/client-sesv2');
    
    const results = {
      total: contacts.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Send emails in batches to respect rate limits
    const batchSize = 10;
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      
      const sendPromises = batch.map(async (contact) => {
        try {
          // Personalize unsubscribe URL for each recipient using subscription ID
          let personalizedHtml = emailData.htmlContent;
          if (emailData.unsubscribeBaseUrl && contact.EmailAddress && emailData.getSubscriptionId) {
            const subscriptionId = await emailData.getSubscriptionId(contact.EmailAddress);
            if (subscriptionId) {
              const unsubscribeUrl = `${emailData.unsubscribeBaseUrl}/${subscriptionId}`;
              personalizedHtml = personalizedHtml.replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);
            }
          }

          const sendCommand = new SendEmailCommand({
            Destination: {
              ToAddresses: [contact.EmailAddress!],
            },
            Content: {
              Simple: {
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
              },
            },
            FromEmailAddress: emailData.fromEmail,
            ReplyToAddresses: [emailData.replyTo],
          });

          const response = await sesClient.send(sendCommand);
          results.successful++;
          console.info(`✅ Sent to ${contact.EmailAddress}: ${response.MessageId}`);
          return response.MessageId;
        } catch (error) {
          results.failed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`${contact.EmailAddress}: ${errorMsg}`);
          console.error(`❌ Failed to send to ${contact.EmailAddress}:`, errorMsg);
          return null;
        }
      });

      await Promise.all(sendPromises);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < contacts.length) {
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
 * Get contact list information and subscriber count
 */
export async function getContactList(contactListName: string, topicName?: string) {
  try {
    console.info('Fetching contact list info:', contactListName, topicName ? `for topic: ${topicName}` : '');

    // Get contact list details
    const listCommand = new GetContactListCommand({
      ContactListName: contactListName,
    });

    const listResponse = await sesClient.send(listCommand);
    console.info('Contact list info fetched successfully:', contactListName);
    
    // Get actual subscriber count using ListContactsCommand
    let subscribersCount = 0;
    try {
      const { ListContactsCommand } = await import('@aws-sdk/client-sesv2');
      const contactsCommand = new ListContactsCommand({
        ContactListName: contactListName,
        Filter: {
          FilteredStatus: 'OPT_IN'
        },
        PageSize: 1000
      });
      
      const contactsResponse = await sesClient.send(contactsCommand);
      let contacts = contactsResponse.Contacts || [];
      
      // Filter by topic if specified
      if (topicName) {
        contacts = contacts.filter(contact => 
          contact.TopicPreferences?.some(topic => 
            topic.TopicName === topicName && topic.SubscriptionStatus === 'OPT_IN'
          )
        );
        console.info(`Filtered to ${contacts.length} contacts for topic: ${topicName}`);
      }
      
      subscribersCount = contacts.length;
      console.info(`Found ${subscribersCount} contacts in list: ${contactListName}`);
    } catch (contactsError) {
      console.warn('Could not fetch contact count, using 0:', contactsError);
    }
    
    return {
      name: listResponse.ContactListName,
      subscribersCount: subscribersCount,
      description: listResponse.Description,
      topicName: topicName,
    };
  } catch (error) {
    console.error('Failed to fetch contact list info:', error);
    
    // Handle permission errors gracefully
    if (error instanceof Error && error.message.includes('AccessDeniedException')) {
      console.warn('Insufficient permissions for GetContactList, returning fallback data');
      return {
        name: contactListName,
        subscribersCount: 0, // Fallback value
        description: 'Contact list (permission to read details not available)',
        topicName: topicName,
      };
    }
    
    throw new Error(`Contact list fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Alternative function to get contact list with subscriber count
 * Note: AWS SES v2 doesn't provide direct subscriber count in GetContactList
 * This is a placeholder for future implementation with ListContacts
 */
export async function getContactListWithSubscriberCount(contactListName: string) {
  try {
    console.info('Fetching contact list with subscriber count:', contactListName);

    // For now, we'll use the basic contact list info
    // In a full implementation, you might want to use ListContacts to get actual count
    const contactListInfo = await getContactList(contactListName);
    
    return {
      name: contactListInfo.name,
      subscribersCount: contactListInfo.subscribersCount,
      description: contactListInfo.description,
    };
  } catch (error) {
    console.error('Failed to fetch contact list with subscriber count:', error);
    throw new Error(`Contact list with subscriber count fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new contact list in AWS SES
 */
export async function createContactList(contactListName: string, description?: string) {
  try {
    console.info('Creating contact list:', contactListName);

    const command = new CreateContactListCommand({
      ContactListName: contactListName,
      Description: description || `Contact list for ${contactListName}`,
    });

    const response = await sesClient.send(command);
    console.info('Contact list created successfully:', contactListName);
    
    return {
      name: contactListName,
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Failed to create contact list:', error);
    throw new Error(`Contact list creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

/**
 * Remove a contact from AWS SES contact list
 * Use this only when you want to completely remove a contact from all topics
 */
export async function removeContactFromList(contactListName: string, email: string) {
  try {
    console.info('Removing contact from list:', { contactListName, email });

    const command = new DeleteContactCommand({
      ContactListName: contactListName,
      EmailAddress: email,
    });

    const response = await sesClient.send(command);
    console.info('Contact removed successfully:', email);
    
    return {
      email,
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Failed to remove contact:', error);
    // If contact doesn't exist, that's okay - consider it already removed
    if (error instanceof Error && (error.name === 'NotFoundException' || error.name === 'BadRequestException')) {
      console.info('Contact not found in SES, considering it already removed:', email);
      return {
        email,
        success: true,
        alreadyRemoved: true
      };
    }
    throw new Error(`Contact removal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add an email address to SES suppression list
 * This prevents SES from sending emails to bounced/complained addresses
 */
export async function addToSuppressionList(email: string, reason: 'BOUNCE' | 'COMPLAINT') {
  try {
    console.info('Adding email to suppression list:', { email, reason });

    const command = new PutSuppressedDestinationCommand({
      EmailAddress: email,
      Reason: reason,
    });

    const response = await sesClient.send(command);
    console.info('Email added to suppression list successfully:', email);
    
    return {
      email,
      reason,
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Failed to add email to suppression list:', error);
    // If already suppressed, that's okay
    if (error instanceof Error && error.message.includes('already exists')) {
      console.info('Email already in suppression list:', email);
      return {
        email,
        reason,
        success: true,
        alreadySuppressed: true
      };
    }
    throw new Error(`Suppression list addition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if an email is in the suppression list
 */
export async function isSuppressed(email: string): Promise<boolean> {
  try {
    const command = new GetSuppressedDestinationCommand({
      EmailAddress: email,
    });

    await sesClient.send(command);
    return true;
  } catch (error) {
    if (error instanceof Error && (error.name === 'NotFoundException' || error.name === 'BadRequestException')) {
      return false;
    }
    console.error('Error checking suppression status:', error);
    return false;
  }
}
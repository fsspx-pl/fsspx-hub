// Validate API key is present
if (!process.env.MAILERLITE_API_KEY) {
  console.error('MAILERLITE_API_KEY environment variable is not set');
}

/**
 * Wrapper for campaign creation with enhanced error handling
 */
export async function createCampaign(campaignData: {
  subject: string;
  from: string;
  reply_to: string;
  content: string;
  groups: string[];
}) {
  try {
    console.log('Creating campaign with data:', {
      subject: campaignData.subject,
      from: campaignData.from,
      groups: campaignData.groups
    });

    const baseUrl = process.env.MAILERLITE_RESTAPI_URL;
    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      throw new Error('MailerLite API key is not set');
    }

    // Transform data to match REST API requirements
    const restData = {
      name: campaignData.subject,
      type: 'regular',
      emails: [{
        subject: campaignData.subject,
        from: campaignData.reply_to,
        from_name: campaignData.from,
        reply_to: campaignData.reply_to,
        content: campaignData.content,
      }],
      groups: campaignData.groups
    };

    const url = `${baseUrl}/campaigns`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(restData),
    });

    if (!response.ok) {
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response body:', errorData);
      throw new Error(errorData.error?.message || `Failed to create campaign: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Campaign created successfully:', responseData.data.id);
    return {
      id: responseData.data.id,
      data: responseData.data
    };
  } catch (error) {
    console.error('Failed to create campaign:', error);
    throw new Error(`Campaign creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Wrapper for campaign sending with enhanced error handling
 */
export async function sendCampaign(campaignId: string) {
  try {
    console.log('Sending campaign with ID:', campaignId);

    const baseUrl = process.env.MAILERLITE_RESTAPI_URL;
    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      throw new Error('MailerLite API key is not set');
    }

    const url = `${baseUrl}/campaigns/${campaignId}/schedule`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    console.log('Sending campaign at:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        delivery: "instant"
      })
    });

    if (!response.ok) {
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response body:', errorData);
      throw new Error(errorData.error?.message || `Failed to send campaign: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Campaign sent successfully:', campaignId);
    return responseData;
  } catch (error) {
    console.error('Failed to send campaign:', error);
    throw new Error(`Campaign sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Wrapper for fetching subscribers count for a group with enhanced error handling
 */
export async function getGroup(groupId: string) {
  try {
    console.log('Fetching group info with ID:', groupId);
    const baseUrl = process.env.MAILERLITE_RESTAPI_URL || 'https://connect.mailerlite.com/api';
    const restApiKey = process.env.MAILERLITE_API_KEY;
    if (!restApiKey) {
      throw new Error('MailerLite REST API key is not set');
    }

    const url = `${baseUrl}/groups/${groupId}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${restApiKey}`,
    };

    console.log('Making request to:', url);
    console.log('Headers:', JSON.stringify(headers, null, 2));

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response body:', errorData);
      throw new Error(errorData.error?.message || `Failed to fetch group info: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Group info fetched successfully:', groupId);
    return {
      name: responseData.data.name,
      subscribersCount: responseData.data.active_count
    };
  } catch (error) {
    console.error('Failed to fetch group info:', error);
    throw new Error(`Group fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

 
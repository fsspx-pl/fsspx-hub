import { NextRequest, NextResponse } from 'next/server';
import config from '@payload-config';
import { Page, Tenant } from '@/payload-types';
import { getPayload } from 'payload';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

/**
 * Fetches page content from Payload CMS
 */
async function getPageContent(id: string) {
  const payload = await getPayload({ config });
  
  const page = await payload.findByID({
    collection: 'pages',
    id: id,
    depth: 1,
  });

  if (!page) {
    throw new Error('Page not found');
  }

  return page;
}


async function createCampaign(page: Page) {
  const unsubscribeText = `
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
      <p>Nie chcesz otrzymywać ogłoszeń? <a href="{$unsubscribe_link}">
        Wypisz się z newslettera
      </a></p>
    </div>
  `;

  const startDate = page.period.start ? parseISO(page.period.start as string) : null;
  const dateSuffix = startDate ? `(${format(startDate, 'dd.MM.yyyy', { locale: pl })})` : null;
  
  const campaignData = {
    title: [page.title, dateSuffix].filter(Boolean).join(' '),
    subject: page.title,
    from: `${(page.tenant as Tenant).type} ${(page.tenant as Tenant).patron} - ${(page.tenant as Tenant).city} | FSSPX`,
    reply_to: process.env.SENDER_SENDER_EMAIL,
    preheader: "Preview text of my campaign",
    content_type: "html",
    content: `
      ${page.content_html}
      ${unsubscribeText}
    `,
    groups: [(page.tenant as Tenant).senderListId],
  };


  // Send to Sender API
  const createResponse = await fetch(`${process.env.SENDER_API_URL}/campaigns`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDER_APIKEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(campaignData)
  });

  // Safely handle the response
  let responseData;
  const contentType = createResponse.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    responseData = await createResponse.json();
  } else {
    const textResponse = await createResponse.text();
    console.error('Received non-JSON response when creating campaign:', textResponse);
    throw new Error('Received non-JSON response from API when creating campaign');
  }
  
  if (!createResponse.ok) {
    throw new Error(`Failed to create campaign: ${responseData.message || 'Unknown error'}`);
  }

  return responseData;
}

/**
 * Sends a created campaign
 */
async function sendCampaign(campaignId: string) {
  console.log(`Sending campaign with ID: ${campaignId}`);
  
  const sendResponse = await fetch(`${process.env.SENDER_API_URL}/campaigns/${campaignId}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDER_APIKEY}`,
      'Content-Type': 'application/json'
    }
  });

  // Safely handle the response
  let responseData;
  const contentType = sendResponse.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    responseData = await sendResponse.json();
  } else {
    const textResponse = await sendResponse.text();
    console.error('Received non-JSON response when sending campaign:', textResponse);
    throw new Error('Received non-JSON response from API when sending campaign');
  }
  
  if (!sendResponse.ok) {
    throw new Error(`Failed to send campaign: ${responseData.message || 'Unknown error'}`);
  }

  return responseData;
}

async function assignCampaign(id: string, campaignId: string) {
  const payload = await getPayload({ config });
  
  const updatedPage = await payload.update({
    collection: 'pages',
    id,
    data: {
      campaignId
    },
  });
  
  return updatedPage;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  try {
    const page = await getPageContent(id);
    
    if (page.campaignId) {
      return NextResponse.json({ 
        message: 'Newsletter has already been sent for this page',
        alreadySent: true 
      }, { status: 400 });
    }
    
    const campaignResponse = await createCampaign(page);
    const sendResponse = await sendCampaign(campaignResponse.data.id);
    await assignCampaign(id, campaignResponse.data.id);
    
    return NextResponse.json({ 
      message: 'Newsletter created and sent successfully',
      campaignId: campaignResponse.id,
      sendStatus: sendResponse
    });
  } catch (error) {
    console.error('Error in newsletter process:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    let statusCode = 500;
    if (errorMessage.includes('Page not found')) {
      statusCode = 404;
    } else if (errorMessage.includes('Failed to create campaign') || 
               errorMessage.includes('Failed to send campaign')) {
      statusCode = 400;
    }
    
    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
} 
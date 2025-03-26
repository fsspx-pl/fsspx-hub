<<<<<<< HEAD
<<<<<<<< HEAD:src/app/api/pages/[id]/send-newsletter/route.ts
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
========
import { NextRequest, NextResponse } from "next/server";
import config from "@payload-config";
=======
import { NextRequest, NextResponse } from "next/server";
import config from '@payload-config';
>>>>>>> 75c64dd (Masses order in the newsletter)
import { Page, Tenant } from "@/payload-types";
import { getPayload } from "payload";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
<<<<<<< HEAD
import Email from "@/emails/pastoral-announcements";
import { render } from "@react-email/components";
import { fetchFooter, fetchSettings } from "@/_api/fetchGlobals";
import { generateServicesContent } from "../../../../../emails/generateServicesContent";

async function getPage(id: string) {
>>>>>>>> 75c64dd (Masses order in the newsletter):src/app/api/pages/[id]/send-newsletter/route.tsx
  const payload = await getPayload({ config });

  const page = await payload.findByID({
    collection: "pages",
    id,
  });

  if (!page || page.type !== "pastoral-announcements") {
    return NextResponse.json(
      { message: "Page not found or not a pastoral announcement" },
      { status: 404 }
    );
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

<<<<<<<< HEAD:src/app/api/pages/[id]/send-newsletter/route.ts
  const startDate = page.period.start ? parseISO(page.period.start as string) : null;
  const dateSuffix = startDate ? `(${format(startDate, 'dd.MM.yyyy', { locale: pl })})` : null;
  
========
  const startDate = page.period.start
    ? parseISO(page.period.start as string)
    : null;
  const dateSuffix = startDate
    ? `(${format(startDate, "dd.MM.yyyy", { locale: pl })})`
    : null;
  const titleWithDateSuffix = [page.title, dateSuffix]
    .filter(Boolean)
    .join(" ");

  const from = `${(page.tenant as Tenant).type} ${(page.tenant as Tenant).patron} - ${(page.tenant as Tenant).city} | FSSPX`;

  const footer = await fetchFooter();
  const settings = await fetchSettings();

  const servicesHTML = await generateServicesContent(page);

  const html = await render(
    <Email
      title={titleWithDateSuffix}
      content_html={page.content_html as string}
      copyright={settings.copyright as string}
      slogan={footer.slogan as string}
      services_html={servicesHTML}
    />,
    {
      pretty: true,
    }
  );

>>>>>>>> 75c64dd (Masses order in the newsletter):src/app/api/pages/[id]/send-newsletter/route.tsx
  const campaignData = {
    title: [page.title, dateSuffix].filter(Boolean).join(' '),
    subject: page.title,
    from,
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
  const createResponse = await fetch(
    `${process.env.SENDER_API_URL}/campaigns`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDER_APIKEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(campaignData),
    }
  );

  // Safely handle the response
  let responseData;
  const contentType = createResponse.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    responseData = await createResponse.json();
  } else {
    const textResponse = await createResponse.text();
    console.error(
      "Received non-JSON response when creating campaign:",
      textResponse
    );
    throw new Error(
      "Received non-JSON response from API when creating campaign"
    );
  }

  if (!createResponse.ok) {
    throw new Error(
      `Failed to create campaign: ${responseData.message || "Unknown error"}`
    );
  }

  return responseData;
}

/**
 * Sends a created campaign
 */
async function sendCampaign(campaignId: string) {
  console.log(`Sending campaign with ID: ${campaignId}`);

  const sendResponse = await fetch(
    `${process.env.SENDER_API_URL}/campaigns/${campaignId}/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDER_APIKEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  // Safely handle the response
  let responseData;
  const contentType = sendResponse.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    responseData = await sendResponse.json();
  } else {
    const textResponse = await sendResponse.text();
    console.error(
      "Received non-JSON response when sending campaign:",
      textResponse
    );
    throw new Error(
      "Received non-JSON response from API when sending campaign"
    );
  }

  if (!sendResponse.ok) {
    throw new Error(
      `Failed to send campaign: ${responseData.message || "Unknown error"}`
    );
  }

  return responseData;
}

async function assignCampaign(id: string, campaignId: string) {
  const payload = await getPayload({ config });

  const updatedPage = await payload.update({
    collection: "pages",
    id,
    data: {
      campaignId,
    },
  });

  return updatedPage;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
<<<<<<<< HEAD:src/app/api/pages/[id]/send-newsletter/route.ts
  const { id } = params;
  
========
  const { id } = await params;

>>>>>>>> 75c64dd (Masses order in the newsletter):src/app/api/pages/[id]/send-newsletter/route.tsx
  try {
    const page = await getPage(id);

    if ((page as Page).campaignId) {
      return NextResponse.json(
        {
          message: "Newsletter has already been sent for this page",
          alreadySent: true,
        },
        { status: 400 }
      );
    }
<<<<<<<< HEAD:src/app/api/pages/[id]/send-newsletter/route.ts
    
    const campaignResponse = await createCampaign(page);
    const sendResponse = await sendCampaign(campaignResponse.data.id);
========

    const campaignResponse = await createCampaign(page as Page);
    // const sendResponse = await sendCampaign(campaignResponse.data.id);
>>>>>>>> 75c64dd (Masses order in the newsletter):src/app/api/pages/[id]/send-newsletter/route.tsx
    await assignCampaign(id, campaignResponse.data.id);

    return NextResponse.json({
      message: "Newsletter created and sent successfully",
      campaignId: campaignResponse.id,
      sendStatus: sendResponse
    });
  } catch (error) {
    console.error("Error in newsletter process:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    let statusCode = 500;
    if (errorMessage.includes("Page not found")) {
      statusCode = 404;
    } else if (
      errorMessage.includes("Failed to create campaign") ||
      errorMessage.includes("Failed to send campaign")
    ) {
      statusCode = 400;
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
=======
import { renderAsync } from "@react-email/render";
import PastoralAnnouncements from "@/emails/pastoral-announcements";
import { getFeastsWithMasses } from "@/common/getFeastsWithMasses";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const payload = await getPayload({ config });

    // Get the page
    const page = await payload.findByID({
      collection: "pages",
      id,
      depth: 2, // To get tenant details
    });

    // Check if page exists and is a pastoral-announcements
    if (!page || page.type !== "pastoral-announcements") {
      return NextResponse.json(
        { message: "Page not found or not a pastoral announcement" },
        { status: 404 }
      );
    }

    // Create campaign on email provider
    const campaignId = await createCampaign(page as Page);

    // Return success
    return NextResponse.json({ campaignId });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return NextResponse.json(
      { message: "Error sending newsletter", error },
      { status: 500 }
    );
  }
}

async function createCampaign(page: Page) {
  // Check if we have a tenant and period dates
  if (!page.tenant || !page.period?.start || !page.period?.end) {
    throw new Error("Missing tenant or period dates");
  }

  // Get feasts with masses for the period
  const feastsWithMasses = await getFeastsWithMasses(
    page.period,
    page.tenant as Tenant
  );

  const startDate = page.period?.start ? parseISO(page.period.start as string) : null;
  const dateSuffix = startDate ? `(${format(startDate, 'dd.MM.yyyy', { locale: pl })})` : null;
  
  // Create email props with non-null content_html
  const emailProps = {
    title: page.title,
    content_html: page.content_html || "", // Provide a default empty string if null/undefined
    slogan: (page.tenant as Tenant)?.city ? `${(page.tenant as Tenant).city} | Ad maiorem Dei gloriam!` : "Ad maiorem Dei gloriam!",
    copyright: (page.tenant as Tenant)?.city ? `${(page.tenant as Tenant).city}.fsspx.pl` : "fsspx.pl",
    feastsWithMasses
  };
  
  // Generate email HTML asynchronously
  const emailHtml = await renderAsync(PastoralAnnouncements(emailProps));
  
  const campaignData = {
    title: [page.title, dateSuffix].filter(Boolean).join(' '),
    subject: page.title,
    from: `${(page.tenant as Tenant)?.type || "Kaplica"} ${(page.tenant as Tenant)?.patron || ""} - ${(page.tenant as Tenant)?.city || ""} | FSSPX`,
    reply_to: process.env.SENDER_SENDER_EMAIL,
    preheader: "Ogłoszenia duszpasterskie",
    content_type: "html",
    content: emailHtml,
    groups: [(page.tenant as Tenant)?.senderListId].filter(Boolean),
  };

  // Here you would actually send the campaign using your email provider's API
  // For example with a service like Mailchimp, SendGrid, etc.
  // This is just a placeholder
  const response = await fetch(`${process.env.EMAIL_PROVIDER_API_URL}/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.EMAIL_PROVIDER_API_KEY}`
    },
    body: JSON.stringify(campaignData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create campaign: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  return result.id; // Return the campaign ID
} 
>>>>>>> 75c64dd (Masses order in the newsletter)

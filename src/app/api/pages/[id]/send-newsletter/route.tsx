import { NextRequest, NextResponse } from "next/server";
import config from "@payload-config";
import { Page, Tenant, Page as PageType, Service } from "@/payload-types";
import { getPayload } from "payload";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import Email from "@/emails/pastoral-announcements";
import { render } from "@react-email/components";
import { fetchFooter, fetchSettings } from "@/_api/fetchGlobals";
import { getFeastsWithMasses } from "@/common/getFeastsWithMasses";
import { serialize } from "@/_components/RichText/serialize";
import React from "react";

// Transform Service objects to match email component's expected format
function transformServiceForEmail(service: Service) {
  return {
    date: service.date,
    category: service.category,
    massType: service.massType || undefined,
    customTitle: service.customTitle || undefined,
    notes: service.notes || undefined,
  };
}

// Transform feasts with masses for email
function transformFeastsForEmail(feastsWithMasses: any[]) {
  return feastsWithMasses.map(feast => ({
    ...feast,
    masses: feast.masses.map(transformServiceForEmail),
  }));
}

// Convert Lexical content to HTML string
async function convertContentToHtml(content: any): Promise<string> {
  if (!content || !content.root || !content.root.children) {
    return "";
  }
  
  const serializedContent = serialize(content.root.children);
  const html = await render(React.createElement('div', {}, serializedContent));
  return html;
}

async function getPage(id: string) {
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
  if (!page.period) {
    throw new Error("Page has no period");
  }

  const unsubscribeText = `
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
      <p>Nie chcesz otrzymywać ogłoszeń? <a href="{$unsubscribe_link}">
        Wypisz się z newslettera
      </a></p>
    </div>
  `;

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

  const html = await render(
    <Email
      title={titleWithDateSuffix}
      content_html={await convertContentToHtml(page.content)}
      copyright={settings.copyright as string}
      slogan={footer.slogan as string}
      feastsWithMasses={transformFeastsForEmail(await getFeastsWithMasses(page.period as PageType['period'], page.tenant as Tenant))}
    />,
    {
      pretty: true,
    }
  );

  const campaignData = {
    subject: titleWithDateSuffix,
    from,
    reply_to: process.env.SENDER_SENDER_EMAIL,
    content_type: "html",
    content: `
      ${html}
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
  const payload = await getPayload({ config });
  payload.logger.info(`Sending campaign with ID: ${campaignId}`);

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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

    const campaignResponse = await createCampaign(page as Page);
    const sendResponse = process.env.NODE_ENV === 'production' ? await sendCampaign(campaignResponse.data.id) : null;
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

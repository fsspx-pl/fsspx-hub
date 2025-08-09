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
import { createCampaign as createMailerliteCampaign, sendCampaign as sendMailerliteCampaign } from "@/utilities/mailerlite";
import React from "react";
import { minify } from "html-minifier-terser";

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

async function minifyAndReplaceQuotes(html: string): Promise<string> {
  let minified = await minify(html, {
    removeComments: true,
    useShortDoctype: true,
    quoteCharacter: "'",
  });
  
  // Remove script tags from the minified HTML
  // Remove the second <!doctype html> if present in the minified HTML
  // This ensures only a single doctype is present at the top of the email HTML
  const doctypePattern = /<!doctype html>/gi;
  const matches = minified.match(doctypePattern);
  if (matches && matches.length > 1) {
    // Remove all but the first occurrence
    let firstIndex = minified.toLowerCase().indexOf('<!doctype html>');
    let before = minified.slice(0, firstIndex + 15); // 15 = length of '<!doctype html>'
    let after = minified.slice(firstIndex + 15).replace(doctypePattern, '');
    minified = before + after;
  }
  return minified
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<template[^>]*>[\s\S]*?<\/template>/gi, '')
    .replace(/ hidden id=['"]S:0['"]/gi, '');
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

  const from_name = `${(page.tenant as Tenant).type} ${(page.tenant as Tenant).patron} - ${(page.tenant as Tenant).city} | FSSPX`;

  const footer = await fetchFooter();
  const settings = await fetchSettings();

  const rawHtml = await render(
    <Email
      title={titleWithDateSuffix}
      content_html={await convertContentToHtml(page.content)}
      copyright={settings.copyright as string}
      slogan={footer.slogan as string}
      feastsWithMasses={transformFeastsForEmail(await getFeastsWithMasses(page.period as PageType['period'], page.tenant as Tenant))}
    />,
    {
      htmlToTextOptions: {
        baseElements: {
          selectors:['body'],
        }
      },
    }
  );

  const html = await minifyAndReplaceQuotes(rawHtml);

  const campaignData = {
    subject: titleWithDateSuffix,
    from: process.env.MAILERLITE_SENDER_EMAIL || '',
    from_name,
    reply_to: process.env.MAILERLITE_SENDER_EMAIL || '',
    content: html,
    groups: [(page.tenant as Tenant).mailingGroupId].filter(Boolean) as string[],
  };

  const response = await createMailerliteCampaign(campaignData);
  return response;
}

/**
 * Sends a created campaign using Mailerlite SDK
 */
async function sendCampaign(campaignId: string) {
  const payload = await getPayload({ config });
  payload.logger.info(`Sending campaign with ID: ${campaignId}`);

  return await sendMailerliteCampaign(campaignId);
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
    const sendResponse = process.env.NODE_ENV === 'production' ? await sendCampaign(campaignResponse.id) : null;
    // await assignCampaign(id, campaignResponse.id);

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

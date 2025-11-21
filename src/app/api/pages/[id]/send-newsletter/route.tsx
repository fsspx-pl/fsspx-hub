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
import { sendBulkEmail } from "@/utilities/awsSes";
import { sendEmail, sendNewsletterToContactList } from "@/utilities/nodemailerSes";
import { personalizeUnsubscribeUrl } from "@/utilities/personalizeUnsubscribe";
import React from "react";
import { minify } from "html-minifier-terser";

function transformServiceForEmail(service: Service) {
  return {
    date: service.date,
    category: service.category,
    massType: service.massType,
    customTitle: service.customTitle,
    notes: service.notes,
  };
}

function transformFeastsForEmail(feastsWithMasses: any[]) {
  return feastsWithMasses.map(feast => ({
    ...feast,
    masses: feast.masses.map(transformServiceForEmail),
  }));
}

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
    depth: 2
  });

  if (!page || page.type !== "pastoral-announcements") {
    return NextResponse.json(
      { message: "Page not found or not a pastoral announcement" },
      { status: 404 }
    );
  }

  return page;
}

async function sendNewsletter({
  page,
  testEmail,
  baseUrl,
}: {
  page: Page;
  testEmail?: string;
  baseUrl: string;
}) {
  if (!page.period) {
    throw new Error("Page has no period");
  }

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
  const fromEmail = (page.tenant as Tenant).address.email;

  const footer = await fetchFooter();
  const settings = await fetchSettings();

  
  const payload = await getPayload({ config });

  // Create function to get subscription ID for an email
  const getSubscriptionId = async (email: string): Promise<string | null> => {
    try {
      const subscription = await payload.find({
        collection: 'newsletterSubscriptions',
        where: {
          and: [
            { email: { equals: email } },
            { tenant: { equals: (page.tenant as Tenant).id } },
            { status: { equals: 'confirmed' } },
          ],
        },
        limit: 1,
      });
      return subscription.docs[0]?.id || null;
    } catch (error) {
      console.error('Error finding subscription ID:', error);
      return null;
    }
  };

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

  const contactListName = (page.tenant as Tenant).mailingGroupId;
  if (!contactListName) {
    throw new Error("Contact list name is not configured for this tenant.");
  }

  const topicName = (page.tenant as Tenant).topicName;
  if (!topicName) {
    throw new Error("Topic name is not configured for this tenant.");
  }

  if (!fromEmail) {
    throw new Error("Sender email is not configured for this tenant.");
  }

  const emailData = {
    subject: titleWithDateSuffix,
    fromName: `${from_name} <${fromEmail}>`,
    fromEmail,
    replyTo: fromEmail,
    htmlContent: html,
    contactListName,
    topicName,
    unsubscribeBaseUrl: `${baseUrl}/newsletter/unsubscribe`,
    getSubscriptionId,
  };

  if (testEmail) {
    console.info('Sending test email to:', testEmail);

    const personalizedHtml = await personalizeUnsubscribeUrl({
      html,
      email: testEmail,
      unsubscribeBaseUrl: emailData.unsubscribeBaseUrl,
      getSubscriptionId: emailData.getSubscriptionId,
      onMissingSubscription: (email) =>
        console.warn(`No subscription found for test email ${email}, UNSUBSCRIBE_URL will not be replaced`),
    });

    const response = await sendEmail({
      from: emailData.fromName,
      to: testEmail,
      subject: `[TEST] ${titleWithDateSuffix}`,
      html: personalizedHtml,
    });
    return response;
  }

  try {
    const response = await sendBulkEmail(emailData);
    return response;
  } catch (error) {
    console.warn('AWS SES bulk email failed, trying Nodemailer:', error);
    
    // Fallback to Nodemailer
    const result = await sendNewsletterToContactList({
      contactListName,
      topicName,
      subject: titleWithDateSuffix,
      html,
      from: emailData.fromName,
      replyTo: fromEmail,
      unsubscribeBaseUrl: emailData.unsubscribeBaseUrl,
      getSubscriptionId,
    });

    return {
      messageId: `nodemailer-${Date.now()}`,
      data: result
    };
  }
}

async function markNewsletterAsSent(id: string) {
  const payload = await getPayload({ config });

  const updatedPage = await payload.update({
    collection: "pages",
    id,
    data: {
      newsletter: { sent: true },
    },
  });

  return updatedPage;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string  }> }
) {
  const { id } = await params;
  const testEmail = request.nextUrl.searchParams.get('testEmail');

  try {
    const page = await getPage(id);

    if ((page as Page).newsletter?.sent && !testEmail) {
      return NextResponse.json(
        {
          message: "Newsletter has already been sent for this page",
          alreadySent: true,
        },
        { status: 400 }
      );
    }

    const newsletterResponse = await sendNewsletter({
      page: page as Page,
      testEmail: testEmail ?? undefined,
      baseUrl: request.headers.get('host') 
        ? `https://${request.headers.get('host')}` 
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    });
    if(!testEmail) await markNewsletterAsSent(id);

    return NextResponse.json({
      message: "Newsletter sent successfully",
      messageId: newsletterResponse.messageId,
      sendStatus: newsletterResponse
    });
  } catch (error) {
    console.error("Error in newsletter process:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    let statusCode = 500;
    if (errorMessage.includes("Page not found")) {
      statusCode = 404;
    } else if (
      errorMessage.includes("Failed to send bulk email") ||
      errorMessage.includes("Contact list name is not configured")
    ) {
      statusCode = 400;
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}

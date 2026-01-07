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
import { serializeForEmail } from "@/_components/RichText/serialize";
import { sendBulkEmailToRecipients } from "@/utilities/awsSes";
import { sendEmail, sendNewsletterToRecipients } from "@/utilities/nodemailerSes";
import { personalizeUnsubscribeUrl } from "@/utilities/personalizeUnsubscribe";
import { getMediaAsEmailAttachment, formatAttachmentsForEmail } from "@/utilities/s3Download";
import React from "react";
import { minify } from "html-minifier-terser";
import { hasText } from '@payloadcms/richtext-lexical/shared'
import { extractMediaFromLexical } from "@/collections/Pages/hooks/extractMediaFromLexical";

const adminApiTranslations = {
  pl: {
    errorNoContent: "Nie można wysłać newslettera: Strona nie ma treści",
    errorAlreadySent: "Newsletter został już wysłany dla tej strony",
    successSent: "Newsletter wysłany pomyślnie",
  },
  en: {
    errorNoContent: "Cannot send newsletter: Page has no content",
    errorAlreadySent: "Newsletter has already been sent for this page",
    successSent: "Newsletter sent successfully",
  },
} as const;

type Locale = 'pl' | 'en';

function getLocaleFromRequest(request: NextRequest): Locale {
  const cookies = request.headers.get('cookie');
  if (cookies) {
    const payloadLngMatch = cookies.match(/payload-lng=([^;]+)/);
    if (payloadLngMatch && (payloadLngMatch[1] === 'en' || payloadLngMatch[1] === 'pl')) {
      return payloadLngMatch[1] as Locale;
    }
  }
  // Fallback to Accept-Language header if cookie is not present
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage?.includes('en')) {
    return 'en';
  }
  return 'pl';
}

function getTranslation(key: keyof typeof adminApiTranslations.pl, locale: Locale): string {
  return adminApiTranslations[locale]?.[key] || adminApiTranslations.pl[key];
}

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
  
  // Hide attachments in HTML - they will be added as separate email attachments
  const serializedContent = serializeForEmail(content.root.children, true);
  
  if (!serializedContent || serializedContent.length === 0) {
    return "";
  }
  
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
    depth: 2,
    draft: true,
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
  skipCalendar: skipCalendarParam,
  baseUrl,
}: {
  page: Page;
  testEmail?: string;
  skipCalendar?: boolean;
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

  const skipCalendar = skipCalendarParam !== undefined 
    ? skipCalendarParam 
    : Boolean((page.newsletter as any)?.skipCalendar);
  
  const feastsWithMasses = skipCalendar 
    ? [] 
    : transformFeastsForEmail(await getFeastsWithMasses(page.period as PageType['period'], page.tenant as Tenant));

  // Convert content to HTML (attachments will be excluded and added separately)
  const contentHtml = await convertContentToHtml(page.content);

  // Extract and prepare attachments from page content
  // These will be added as separate email attachments (not in HTML body)
  let attachments: Array<{ filename: string; content: Buffer; contentType?: string }> = [];
  if (page.content) {
    try {
      // Extract media IDs from Lexical content
      const mediaIds = extractMediaFromLexical(page.content);
      
      if (mediaIds.length > 0) {
        // Fetch full media documents and prepare as email attachments
        const attachmentPromises = mediaIds.map(async (mediaId) => {
          try {
            const mediaDoc = await payload.findByID({ 
              collection: 'media', 
              id: mediaId 
            });
            
            if (!mediaDoc) {
              console.warn(`Media document ${mediaId} not found in Payload`);
              return null;
            }
            
            try {
              // Pass page ID to allow fallback to page-specific prefix
              return await getMediaAsEmailAttachment(mediaDoc, page.id);
            } catch (s3Error: any) {
              // Handle S3 errors gracefully - log but don't fail the entire newsletter
              if (s3Error?.message?.includes('not found') || s3Error?.message?.includes('NoSuchKey')) {
                // Skip missing attachments silently
              } else {
                console.error(`Failed to download attachment from S3:`, s3Error);
              }
              return null;
            }
          } catch (error) {
            console.error(`Failed to fetch media ${mediaId} for newsletter attachment:`, error);
            return null;
          }
        });

        const attachmentResults = await Promise.all(attachmentPromises);
        attachments = attachmentResults.filter((att): att is { filename: string; content: Buffer; contentType?: string } => att !== null);
      }
    } catch (error) {
      console.error('Error preparing attachments for newsletter:', error);
      // Don't fail the entire newsletter send if attachments fail
      // Just log the error and continue without attachments
    }
  }

  const rawHtml = await render(
    <Email
      title={titleWithDateSuffix}
      content_html={contentHtml}
      copyright={settings.copyright as string}
      slogan={footer.slogan as string}
      feastsWithMasses={feastsWithMasses}
      attachmentCount={attachments.length}
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

  // Attachments are already extracted above (before email rendering)
  // They are used in the email template and will be attached to the email

  const tenantId = (page.tenant as Tenant).id;
  if (!fromEmail) {
    throw new Error("Sender email is not configured for this tenant.");
  }

  // Get confirmed subscribers from Payload (source of truth)
  const subscriptions = await payload.find({
    collection: 'newsletterSubscriptions',
    where: {
      and: [
        { tenant: { equals: tenantId } },
        { status: { equals: 'confirmed' } },
      ],
    },
    limit: 10000, // Adjust if you have more subscribers
  });

  const recipients = subscriptions.docs.map(sub => sub.email);

  if (recipients.length === 0) {
    throw new Error("No confirmed subscribers found for this tenant.");
  }


  const emailData = {
    subject: titleWithDateSuffix,
    fromName: `${from_name} <${fromEmail}>`,
    fromEmail,
    replyTo: fromEmail,
    htmlContent: html,
    recipients,
    unsubscribeBaseUrl: `${baseUrl}/newsletter/unsubscribe`,
    getSubscriptionId,
    attachments,
  };

  if (testEmail) {
    const personalizedHtml = await personalizeUnsubscribeUrl({
      html,
      email: testEmail,
      unsubscribeBaseUrl: emailData.unsubscribeBaseUrl,
      getSubscriptionId: emailData.getSubscriptionId,
    });

    const response = await sendEmail({
      from: emailData.fromName,
      to: testEmail,
      subject: `[TEST] ${titleWithDateSuffix}`,
      html: personalizedHtml,
      attachments: formatAttachmentsForEmail(attachments),
    });
    
    return response;
  }

  try {
    const response = await sendBulkEmailToRecipients(emailData);
    return response;
  } catch (error) {
    console.warn('AWS SES bulk email failed, trying Nodemailer:', error);
    
    // Fallback to Nodemailer
    const result = await sendNewsletterToRecipients({
      recipients: emailData.recipients,
      subject: titleWithDateSuffix,
      html,
      from: emailData.fromName,
      replyTo: fromEmail,
      unsubscribeBaseUrl: emailData.unsubscribeBaseUrl,
      getSubscriptionId,
      attachments: formatAttachmentsForEmail(attachments),
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
  const skipCalendarParam = request.nextUrl.searchParams.get('skipCalendar');
  const skipCalendar = skipCalendarParam === 'true';
  const locale = getLocaleFromRequest(request);

  try {
    const page = await getPage(id);

    if ((page as Page).newsletter?.sent && !testEmail) {
      return NextResponse.json(
        {
          message: getTranslation('errorAlreadySent', locale),
          alreadySent: true,
        },
        { status: 400 }
      );
    }

    if (!hasText((page as Page).content)) {
      return NextResponse.json(
        {
          message: getTranslation('errorNoContent', locale),
        },
        { status: 400 }
      );
    }

    const newsletterResponse = await sendNewsletter({
      page: page as Page,
      testEmail: testEmail ?? undefined,
      skipCalendar,
      baseUrl: request.headers.get('host') 
        ? `https://${request.headers.get('host')}` 
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    });
    if(!testEmail) await markNewsletterAsSent(id);

    return NextResponse.json({
      message: getTranslation('successSent', locale),
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

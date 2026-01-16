import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { Announcement, Tenant, Announcement as AnnouncementType, Service } from '@/payload-types'
import { getPayload } from 'payload'
import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import Email from '@/emails/pastoral-announcements'
import { render } from '@react-email/components'
import { fetchFooter, fetchSettings } from '@/_api/fetchGlobals'
import { getFeastsWithMasses } from '@/common/getFeastsWithMasses'
import { serializeForEmail } from '@/_components/RichText/serialize'
import { sendBulkEmailToRecipients } from '@/utilities/awsSes'
import { sendEmail, sendNewsletterToRecipients } from '@/utilities/nodemailerSes'
import { personalizeUnsubscribeUrl } from '@/utilities/personalizeUnsubscribe'
import { formatAttachmentsForEmail } from '@/utilities/s3Download'
import {
  fetchAnnouncementAttachments,
  prepareEmailAttachments,
} from '@/utilities/fetchAnnouncementAttachments'
import React from 'react'
import { minify } from 'html-minifier-terser'
import { hasText } from '@payloadcms/richtext-lexical/shared'

const adminApiTranslations = {
  pl: {
    errorNoContent: 'Nie można wysłać newslettera: Ogłoszenie nie ma treści',
    errorAlreadySent: 'Newsletter został już wysłany dla tego ogłoszenia',
    successSent: 'Newsletter wysłany pomyślnie',
  },
  en: {
    errorNoContent: 'Cannot send newsletter: Announcement has no content',
    errorAlreadySent: 'Newsletter has already been sent for this announcement',
    successSent: 'Newsletter sent successfully',
  },
} as const

type Locale = 'pl' | 'en'

function getLocaleFromRequest(request: NextRequest): Locale {
  const cookies = request.headers.get('cookie')
  if (cookies) {
    const payloadLngMatch = cookies.match(/payload-lng=([^;]+)/)
    if (payloadLngMatch && (payloadLngMatch[1] === 'en' || payloadLngMatch[1] === 'pl')) {
      return payloadLngMatch[1] as Locale
    }
  }
  // Fallback to Accept-Language header if cookie is not present
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage?.includes('en')) {
    return 'en'
  }
  return 'pl'
}

function getTranslation(key: keyof typeof adminApiTranslations.pl, locale: Locale): string {
  return adminApiTranslations[locale]?.[key] || adminApiTranslations.pl[key]
}

function transformServiceForEmail(service: Service) {
  return {
    date: service.date,
    category: service.category,
    massType: service.massType,
    customTitle: service.customTitle,
    notes: service.notes,
  }
}

function transformFeastsForEmail(feastsWithMasses: any[]) {
  return feastsWithMasses.map((feast) => ({
    ...feast,
    masses: feast.masses.map(transformServiceForEmail),
  }))
}

async function convertContentToHtml(content: any): Promise<string> {
  if (!content || !content.root || !content.root.children) {
    return ''
  }

  // Hide attachments in HTML - they will be added as separate email attachments
  const serializedContent = serializeForEmail(content.root.children, true)

  if (!serializedContent || serializedContent.length === 0) {
    return ''
  }

  const html = await render(React.createElement('div', {}, serializedContent))

  return html
}

async function minifyAndReplaceQuotes(html: string): Promise<string> {
  let minified = await minify(html, {
    removeComments: true,
    useShortDoctype: true,
    quoteCharacter: "'",
  })

  // Remove script tags from the minified HTML
  // Remove the second <!doctype html> if present in the minified HTML
  // This ensures only a single doctype is present at the top of the email HTML
  const doctypePattern = /<!doctype html>/gi
  const matches = minified.match(doctypePattern)
  if (matches && matches.length > 1) {
    // Remove all but the first occurrence
    const firstIndex = minified.toLowerCase().indexOf('<!doctype html>')
    const before = minified.slice(0, firstIndex + 15) // 15 = length of '<!doctype html>'
    const after = minified.slice(firstIndex + 15).replace(doctypePattern, '')
    minified = before + after
  }
  return minified
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<template[^>]*>[\s\S]*?<\/template>/gi, '')
    .replace(/ hidden id=['"]S:0['"]/gi, '')
}

async function getAnnouncement(id: string) {
  const payload = await getPayload({ config })

  const announcement = await payload.findByID({
    collection: 'announcements',
    id,
    depth: 2,
    draft: true,
  })

  if (!announcement || announcement.type !== 'pastoral-announcements') {
    return NextResponse.json(
      { message: 'Announcement not found or not a pastoral announcement' },
      { status: 404 },
    )
  }

  return announcement
}

async function sendNewsletter({
  announcement,
  testEmail,
  skipCalendar: skipCalendarParam,
  baseUrl,
}: {
  announcement: Announcement
  testEmail?: string
  skipCalendar?: boolean
  baseUrl: string
}) {
  if (!announcement.period) {
    throw new Error('Announcement has no period')
  }

  const startDate = announcement.period.start ? parseISO(announcement.period.start as string) : null
  const dateSuffix = startDate ? `(${format(startDate, 'dd.MM.yyyy', { locale: pl })})` : null
  const titleWithDateSuffix = [announcement.title, dateSuffix].filter(Boolean).join(' ')

  const from_name = `${(announcement.tenant as Tenant).type} ${(announcement.tenant as Tenant).patron} - ${(announcement.tenant as Tenant).city} | FSSPX`
  const fromEmail = (announcement.tenant as Tenant).address.email

  const footer = await fetchFooter()
  const settings = await fetchSettings()

  const payload = await getPayload({ config })

  // Create function to get subscription ID for an email
  const getSubscriptionId = async (email: string): Promise<string | null> => {
    try {
      const subscription = await payload.find({
        collection: 'newsletterSubscriptions',
        where: {
          and: [
            { email: { equals: email } },
            { tenant: { equals: (announcement.tenant as Tenant).id } },
            { status: { equals: 'confirmed' } },
          ],
        },
        limit: 1,
      })
      return subscription.docs[0]?.id || null
    } catch (error) {
      console.error('Error finding subscription ID:', error)
      return null
    }
  }

  const skipCalendar =
    skipCalendarParam !== undefined ? skipCalendarParam : Boolean((announcement.newsletter as any)?.skipCalendar)

  const feastsWithMasses = skipCalendar
    ? []
    : transformFeastsForEmail(
        await getFeastsWithMasses(announcement.period as AnnouncementType['period'], announcement.tenant as Tenant),
      )

  const contentHtml = await convertContentToHtml(announcement.content)

  // Fetch media documents and download from S3 for email attachments
  const { attachments: mediaList } = await fetchAnnouncementAttachments(announcement)
  const attachments = await prepareEmailAttachments(mediaList, announcement.id)

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
          selectors: ['body'],
        },
      },
    },
  )

  const html = await minifyAndReplaceQuotes(rawHtml)

  const tenantId = (announcement.tenant as Tenant).id
  if (!fromEmail) {
    throw new Error('Sender email is not configured for this tenant.')
  }

  // Get confirmed subscribers from Payload (source of truth)
  const subscriptions = await payload.find({
    collection: 'newsletterSubscriptions',
    where: {
      and: [{ tenant: { equals: tenantId } }, { status: { equals: 'confirmed' } }],
    },
    limit: 10000, // Adjust if you have more subscribers
  })

  const recipients = subscriptions.docs.map((sub) => sub.email)

  if (recipients.length === 0) {
    throw new Error('No confirmed subscribers found for this tenant.')
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
  }

  if (testEmail) {
    const personalizedHtml = await personalizeUnsubscribeUrl({
      html,
      email: testEmail,
      unsubscribeBaseUrl: emailData.unsubscribeBaseUrl,
      getSubscriptionId: emailData.getSubscriptionId,
    })

    const response = await sendEmail({
      from: emailData.fromName,
      to: testEmail,
      subject: `[TEST] ${titleWithDateSuffix}`,
      html: personalizedHtml,
      attachments: formatAttachmentsForEmail(attachments),
    })

    return response
  }

  try {
    const response = await sendBulkEmailToRecipients(emailData)
    return response
  } catch (error) {
    console.warn('AWS SES bulk email failed, trying Nodemailer:', error)

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
    })

    return {
      messageId: `nodemailer-${Date.now()}`,
      data: result,
    }
  }
}

async function markNewsletterAsSent(id: string) {
  const payload = await getPayload({ config })

  const updatedAnnouncement = await payload.update({
    collection: 'announcements',
    id,
    data: {
      newsletter: { sent: true },
    },
  })

  return updatedAnnouncement
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const testEmail = request.nextUrl.searchParams.get('testEmail')
  const skipCalendarParam = request.nextUrl.searchParams.get('skipCalendar')
  const skipCalendar = skipCalendarParam === 'true'
  const locale = getLocaleFromRequest(request)

  try {
    const announcement = await getAnnouncement(id)

    if ((announcement as Announcement).newsletter?.sent && !testEmail) {
      return NextResponse.json(
        {
          message: getTranslation('errorAlreadySent', locale),
          alreadySent: true,
        },
        { status: 400 },
      )
    }

    if (!hasText((announcement as Announcement).content)) {
      return NextResponse.json(
        {
          message: getTranslation('errorNoContent', locale),
        },
        { status: 400 },
      )
    }

    const newsletterResponse = await sendNewsletter({
      announcement: announcement as Announcement,
      testEmail: testEmail ?? undefined,
      skipCalendar,
      baseUrl: request.headers.get('host')
        ? `https://${request.headers.get('host')}`
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    })
    if (!testEmail) await markNewsletterAsSent(id)

    return NextResponse.json({
      message: getTranslation('successSent', locale),
      messageId: newsletterResponse.messageId,
      sendStatus: newsletterResponse,
    })
  } catch (error) {
    console.error('Error in newsletter process:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'

    let statusCode = 500
    if (errorMessage.includes('Announcement not found')) {
      statusCode = 404
    } else if (
      errorMessage.includes('Failed to send bulk email') ||
      errorMessage.includes('Contact list name is not configured')
    ) {
      statusCode = 400
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode })
  }
}


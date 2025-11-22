import { sendEmail } from './nodemailerSes';
import { render } from '@react-email/components';
import React from 'react';
import EventConfirmationEmail from '@/emails/event-confirmation';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

type SendEventConfirmationEmailArgs = {
  submission: any;
  event: any;
  token: string;
  req: any;
};

export async function sendEventConfirmationEmail({
  submission,
  event,
  token,
  req,
}: SendEventConfirmationEmailArgs): Promise<void> {
  const payload = await getPayload({ config: configPromise });
  
  // Get tenant info
  const tenantId = typeof event.tenant === 'string' ? event.tenant : event.tenant?.id;
  const tenant = await payload.findByID({
    collection: 'tenants',
    id: tenantId,
  });

  // Get base URL
  const baseUrl = req.headers?.host
    ? `https://${req.headers.host}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Build confirmation and manage URLs
  const confirmationUrl = `${baseUrl}/wydarzenia/${event.slug}/confirm/${token}`;
  const manageUrl = `${baseUrl}/wydarzenia/${event.slug}/manage/${token}`;

  // Get email from submission data
  const submissionData = submission.submissionData || {};
  const email = submissionData.email || submissionData.Email || Object.values(submissionData).find(
    (value: any) => typeof value === 'string' && value.includes('@')
  ) as string | undefined;

  if (!email) {
    console.warn('No email found in submission data, skipping confirmation email');
    return;
  }

  const fromEmail = process.env.FROM_ADDRESS || 'noreply@example.com';
  const fromName = process.env.FROM_NAME || 'FSSPX';
  const chapelInfo = `${tenant.type} ${tenant.patron || ''} - ${tenant.city}`;

  const settings = await payload.findGlobal({
    slug: 'settings',
  });
  const copyright = (settings?.copyright as string) || 'city.fsspx.pl';

  const locale: 'pl' | 'en' = 'pl';

  const emailSubject = event.confirmationEmailSubject || 
    `Potwierdź zapis na ${event.title} - ${chapelInfo}`;

  const confirmationEmailHtml = await render(
    React.createElement(EventConfirmationEmail, {
      confirmationUrl,
      manageUrl,
      eventTitle: event.title,
      chapelInfo,
      copyright,
      locale,
    }),
    {
      htmlToTextOptions: {
        baseElements: {
          selectors: ['body'],
        },
      },
    }
  );

  await sendEmail({
    to: email,
    from: `${fromName} <${fromEmail}>`,
    subject: emailSubject,
    html: confirmationEmailHtml,
  });

  console.log('Event confirmation email sent successfully to:', email);
}


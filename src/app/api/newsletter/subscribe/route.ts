import { NextRequest, NextResponse } from 'next/server';
import { fetchTenant } from '@/_api/fetchTenants';
import { fetchSettings } from '@/_api/fetchGlobals';
import { addContactToList, contactExistsInList } from '@/utilities/awsSes';
import { sendEmail } from '@/utilities/nodemailerSes';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { render } from '@react-email/components';
import NewsletterConfirmationEmail from '@/emails/newsletter-confirmation';
import { newsletterSignupTranslations } from '@/_components/NewsletterSignupForm/translations';
import React from 'react';

/**
 * Verify Cloudflare Turnstile token
 */
async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY is not set');
    return false;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, subdomain, turnstileToken } = body;

    const isDevelopment = process.env.NODE_ENV === 'development';

    // Validate required fields
    if (!email || !subdomain) {
      return NextResponse.json(
        { error: 'Missing required fields: email and subdomain' },
        { status: 400 }
      );
    }

    // In production, require turnstileToken; in development, skip verification
    if (!isDevelopment && !turnstileToken) {
      return NextResponse.json(
        { error: 'Missing required field: turnstileToken' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Verify Turnstile token (skip in development)
    if (!isDevelopment) {
      const isTokenValid = await verifyTurnstileToken(turnstileToken);
      if (!isTokenValid) {
        return NextResponse.json(
          { error: 'Invalid or expired verification token' },
          { status: 400 }
        );
      }
    } else {
      console.log('⚠️  Development mode: Skipping Turnstile verification');
    }

    // Fetch tenant by subdomain
    const tenant = await fetchTenant(subdomain);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Check if tenant has newsletter settings configured
    const contactListName = tenant.mailingGroupId;
    const topicName = tenant.topicName;

    if (!contactListName || !topicName) {
      return NextResponse.json(
        { error: 'Newsletter settings not configured for this tenant' },
        { status: 400 }
      );
    }

    const payload = await getPayload({
      config: configPromise,
    });

    // Check if subscription already exists in Payload
    const existingSubscription = await payload.find({
      collection: 'newsletterSubscriptions',
      where: {
        and: [
          {
            email: {
              equals: email,
            },
          },
          {
            subdomain: {
              equals: subdomain,
            },
          },
        ],
      },
      limit: 1,
    });

    // Check if contact already exists in AWS SES
    const existsInAwsSes = await contactExistsInList(contactListName, email, topicName);

    // If exists in Payload as confirmed OR in AWS SES, return already exists page
    if (existingSubscription.docs.length > 0 && existingSubscription.docs[0].status === 'confirmed') {
      const baseUrl = request.headers.get('host') 
        ? `https://${request.headers.get('host')}` 
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      return NextResponse.json({
        success: false,
        alreadyExists: true,
        redirectUrl: `${baseUrl}/${subdomain}/newsletter/already-subscribed`,
      });
    }

    if (existsInAwsSes) {
      const baseUrl = request.headers.get('host') 
        ? `https://${request.headers.get('host')}` 
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      return NextResponse.json({
        success: false,
        alreadyExists: true,
        redirectUrl: `${baseUrl}/${subdomain}/newsletter/already-subscribed`,
      });
    }

    // Store subscription in Payload (pending status)
    let subscription;
    if (existingSubscription.docs.length > 0) {
      // If pending, use existing subscription
      subscription = existingSubscription.docs[0];
    } else {
      // Create new subscription record
      subscription = await payload.create({
        collection: 'newsletterSubscriptions',
        data: {
          email,
          subdomain,
          tenant: tenant.id,
          status: 'pending',
        },
      });
    }

    // Send confirmation email with subscription ID
    const baseUrl = request.headers.get('host') 
      ? `https://${request.headers.get('host')}` 
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const confirmationUrl = `${baseUrl}/${subdomain}/newsletter/confirm/${subscription.id}`;
      
    const fromEmail = process.env.FROM_ADDRESS || 'noreply@example.com';
    const fromName = process.env.FROM_NAME || 'FSSPX';
    const chapelInfo = `${tenant.type} ${tenant.patron || ''} - ${tenant.city}`;

    const settings = await fetchSettings();
    const copyright = (settings?.copyright as string) || 'city.fsspx.pl';

    const locale: 'pl' | 'en' = 'pl';
    const t = (key: keyof typeof newsletterSignupTranslations.pl) => 
      newsletterSignupTranslations[locale]?.[key] || newsletterSignupTranslations.pl[key];

    const confirmationEmailHtml = await render(
      React.createElement(NewsletterConfirmationEmail, {
        confirmationUrl,
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

    const confirmationEmailText = `
${t('emailConfirmationTitle')}

${t('emailConfirmationGreeting')} ${chapelInfo}!

${t('emailConfirmationInstructions')}

${confirmationUrl}

${t('emailConfirmationDisclaimer')} ${chapelInfo}, ${t('emailConfirmationIgnore')}
    `.trim();

    await sendEmail({
      to: email,
      from: `${fromName} <${fromEmail}>`,
      subject: `${t('emailConfirmationTitle')} - ${chapelInfo}`,
      html: confirmationEmailHtml,
      text: confirmationEmailText,
    });

    console.log('Confirmation email sent successfully to:', email);
    
    return NextResponse.json({
      success: true,
      message: 'Subscription request received. Please check your email to confirm.',
    });
  } catch (error) {
    console.error('Error in newsletter subscription API:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return NextResponse.json(
      { error: 'Failed to process subscription. Please try again later.' },
      { status: 500 }
    );
  }
}


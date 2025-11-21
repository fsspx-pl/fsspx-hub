import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeFromTopic } from '@/utilities/awsSes';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { Tenant } from '@/payload-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, email, subdomain } = body;

    // Validate required fields
    if (!subscriptionId || !email || !subdomain) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionId, email, and subdomain' },
        { status: 400 }
      );
    }

    const payload = await getPayload({
      config: configPromise,
    });

    // Find subscription by ID
    let subscription;
    try {
      subscription = await payload.findByID({
        collection: 'newsletterSubscriptions',
        id: subscriptionId,
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const tenantRef = subscription.tenant as Tenant | string | undefined;
    const tenantId =
      typeof tenantRef === 'string'
        ? tenantRef
        : tenantRef && typeof tenantRef === 'object'
          ? tenantRef.id
          : undefined;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Subscription tenant data is missing' },
        { status: 400 }
      );
    }

    const tenantDoc = (await payload.findByID({
      collection: 'tenants',
      id: tenantId,
    })) as Tenant;

    const tenantSubdomain = tenantDoc.domain;
    if (!tenantSubdomain) {
      return NextResponse.json(
        { error: 'Tenant domain is not configured correctly' },
        { status: 400 }
      );
    }
    if (subscription.email !== email || tenantSubdomain !== subdomain) {
      return NextResponse.json(
        { error: 'Subscription details do not match' },
        { status: 400 }
      );
    }

    // Check if already unsubscribed
    if (subscription.status === 'unsubscribed') {
      return NextResponse.json({
        success: true,
        message: 'Already unsubscribed from newsletter',
        alreadyUnsubscribed: true,
      });
    }

    const contactListName = tenantDoc.mailingGroupId;
    const topicName = tenantDoc.topicName;

    if (!contactListName || !topicName) {
      return NextResponse.json(
        { error: 'Newsletter settings not configured for this tenant' },
        { status: 400 }
      );
    }

    let awsError = false;
    try {
      console.log('Unsubscribing contact from topic in AWS SES:', { contactListName, email, topicName });
      await unsubscribeFromTopic(contactListName, email, topicName);
      console.log('Contact unsubscribed from topic in AWS SES successfully');
    } catch (error) {
      console.error('Error unsubscribing contact from topic in AWS SES:', error);
      awsError = true;
    }

    // Update subscription status to unsubscribed in Payload
    await payload.update({
      collection: 'newsletterSubscriptions',
      id: subscription.id,
      data: {
        status: 'unsubscribed',
      },
    });

    console.log('Newsletter subscription unsubscribed:', { email, subdomain, subscriptionId });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      awsError,
    });
  } catch (error) {
    console.error('Error in newsletter unsubscribe API:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return NextResponse.json(
      { error: 'Failed to process unsubscribe request. Please try again later.' },
      { status: 500 }
    );
  }
}

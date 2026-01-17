import { NewsletterStatusPage } from '@/_components/Newsletter/NewsletterStatusPage';
import { unsubscribeFromTopic } from '@/utilities/aws/ses';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { redirect } from 'next/navigation';
import { Tenant } from '@/payload-types';
import { getNewsletterTranslation } from '@/_components/Newsletter/translations';

export const dynamic = 'force-dynamic';

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ domain: string; subscriptionId: string }>;
}) {
  const { domain, subscriptionId } = await params;
  const subdomain = domain.split('.')[0];

  if (!subscriptionId) {
    redirect(`/newsletter/error`);
  }

  try {
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
      redirect(`/newsletter/error`);
    }

    const tenantRef = subscription.tenant as Tenant | string | undefined;
    const tenantId =
      typeof tenantRef === 'string'
        ? tenantRef
        : tenantRef && typeof tenantRef === 'object'
          ? tenantRef.id
          : undefined;

    if (!tenantId) {
      redirect(`/newsletter/error`);
    }

    const tenantDoc = (await payload.findByID({
      collection: 'tenants',
      id: tenantId,
    })) as Tenant;

    const tenantSubdomain = tenantDoc.domain;
    if (!tenantSubdomain || tenantSubdomain !== subdomain) {
      redirect(`/newsletter/error`);
    }

    // Check if already unsubscribed
    if (subscription.status === 'unsubscribed') {
      const chapelInfo = `${tenantDoc.type} ${tenantDoc.patron || ''} - ${tenantDoc.city}`;
      
      const t = (key: Parameters<typeof getNewsletterTranslation>[0]) => 
        getNewsletterTranslation(key, 'pl', 'unsubscribe');
      
      return (
        <NewsletterStatusPage
          variant="success"
          message={t('unsubscribeSuccessMessage')}
          chapelInfo={chapelInfo}
          locale="pl"
          showBackButton={false}
        />
      );
    }

    const contactListName = tenantDoc.mailingGroupId;
    const topicName = tenantDoc.topicName;

    if (!contactListName || !topicName) {
      return (
        <NewsletterStatusPage
          variant="warning"
          message="Ustawienia newslettera nie są skonfigurowane dla tej lokalizacji."
          locale="pl"
        />
      );
    }

    // Immediately unsubscribe
    let awsError = false;
    try {
      console.log('Unsubscribing contact from topic in AWS SES:', { contactListName, email: subscription.email, topicName });
      await unsubscribeFromTopic(contactListName, subscription.email, topicName);
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

    console.log('Newsletter subscription unsubscribed:', { email: subscription.email, subdomain, subscriptionId: subscription.id });

    const chapelInfo = `${tenantDoc.type} ${tenantDoc.patron || ''} - ${tenantDoc.city}`;
    const t = (key: Parameters<typeof getNewsletterTranslation>[0]) => 
      getNewsletterTranslation(key, 'pl', 'unsubscribe');

    return (
      <NewsletterStatusPage
        variant={awsError ? 'warning' : 'success'}
        message={t('unsubscribeSuccessMessage')}
        chapelInfo={chapelInfo}
        locale="pl"
        showBackButton={false}
      />
    );
  } catch (error) {
    console.error('Error loading unsubscribe page:', error);
    redirect(`/newsletter/error`);
  }
}


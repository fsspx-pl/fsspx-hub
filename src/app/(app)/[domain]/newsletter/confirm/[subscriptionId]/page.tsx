import { NewsletterStatusPage } from '@/_components/Newsletter/NewsletterStatusPage';
import { addContactToList } from '@/utilities/awsSes';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { redirect } from 'next/navigation';
import { Tenant } from '@/payload-types';
import { getNewsletterTranslation } from '@/_components/Newsletter/translations';

export const dynamic = 'force-dynamic';

export default async function ConfirmNewsletterPage({
  params,
}: {
  params: Promise<{ domain: string; subscriptionId: string }>;
}) {
  const { domain, subscriptionId } = await params;
  const subdomain = domain.split('.')[0];

  if (!subscriptionId) {
    redirect(`/${subdomain}/newsletter/error`);
  }

  // Find the subscription in Payload by ID
  const payload = await getPayload({
    config: configPromise,
  });

  let subscription;
  try {
    subscription = await payload.findByID({
      collection: 'newsletterSubscriptions',
      id: subscriptionId,
    });
  } catch (error) {
    redirect(`/${subdomain}/newsletter/error`);
  }

  const tenantRef = subscription.tenant as Tenant | string | undefined;
  const tenantId =
    typeof tenantRef === 'string'
      ? tenantRef
      : tenantRef && typeof tenantRef === 'object'
        ? tenantRef.id
        : undefined;

  if (!tenantId) {
    redirect(`/${subdomain}/newsletter/error`);
  }

  const tenantDoc = (await payload.findByID({
    collection: 'tenants',
    id: tenantId,
  })) as Tenant;

  const tenantSubdomain = tenantDoc.domain;
  if (!tenantSubdomain || tenantSubdomain !== subdomain) {
    redirect(`/${subdomain}/newsletter/error`);
  }

  const contactListName = tenantDoc.mailingGroupId;
  const topicName = tenantDoc.topicName;

  if (!contactListName || !topicName) {
    redirect(`/${subdomain}/newsletter/error`);
  }

  // If already confirmed, show confirmed page
  if (subscription.status === 'confirmed') {
    const t = (key: Parameters<typeof getNewsletterTranslation>[0]) => 
      getNewsletterTranslation(key, 'pl', 'subscribe');
    
    return (
      <NewsletterStatusPage
        variant="success"
        title={t('confirmationTitle')}
        message={t('confirmationMessageAlready')}
        locale="pl"
      />
    );
  }

    // Add contact to AWS SES
    let awsError = false;
    try {
      console.log('Adding confirmed contact to AWS SES:', { contactListName, email: subscription.email, topicName });
      await addContactToList(contactListName, subscription.email, topicName);
      console.log('Contact added to AWS SES successfully');
    } catch (error) {
      console.error('Error adding contact to AWS SES:', error);
      awsError = true;
    }

    // Update subscription status to confirmed
    await payload.update({
      collection: 'newsletterSubscriptions',
      id: subscription.id,
      data: {
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
      },
    });

    console.log('Newsletter subscription confirmed:', { email: subscription.email, subdomain });

    const t = (key: Parameters<typeof getNewsletterTranslation>[0]) => 
      getNewsletterTranslation(key, 'pl', 'subscribe');

    // Show success page
    return (
      <NewsletterStatusPage
        variant={awsError ? 'warning' : 'success'}
        title={t('confirmationTitle')}
        message={t('confirmationMessage')}
        locale="pl"
      />
    );
  }


import { NewsletterStatusPage } from '@/_components/NewsletterStatusPage';
import { addContactToList } from '@/utilities/awsSes';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { redirect } from 'next/navigation';

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

  // Verify subdomain matches
  if (subscription.subdomain !== subdomain) {
    redirect(`/${subdomain}/newsletter/error`);
  }

  // Get tenant to get newsletter settings
  const tenant = subscription.tenant;
  if (typeof tenant === 'string') {
    const tenantDoc = await payload.findByID({
      collection: 'tenants',
      id: tenant,
    });
    const contactListName = tenantDoc.mailingGroupId;
    const topicName = tenantDoc.topicName;

    if (!contactListName || !topicName) {
      redirect(`/${subdomain}/newsletter/error`);
    }

    // If already confirmed, show confirmed page
    if (subscription.status === 'confirmed') {
      return (
        <NewsletterStatusPage
          subdomain={subdomain}
          title="Subskrypcja już potwierdzona"
          message="Twoja subskrypcja newslettera została już wcześniej potwierdzona. Będziesz otrzymywać ogłoszenia duszpasterskie na swój adres email."
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

    // Show success page
    return (
      <NewsletterStatusPage
        subdomain={subdomain}
        title="Subskrypcja potwierdzona!"
        message="Dziękujemy! Twoja subskrypcja newslettera została potwierdzona. Będziesz otrzymywać ogłoszenia duszpasterskie na swój adres email."
        showWarning={awsError}
      />
    );
  }

  redirect(`/${subdomain}/newsletter/error`);
}


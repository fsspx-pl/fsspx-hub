import { NewsletterStatusPage } from '@/_components/Newsletter/NewsletterStatusPage';
import { UnsubscribeAction } from '@/_components/Newsletter/UnsubscribeAction';
import { fetchTenant } from '@/_api/fetchTenants';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { redirect } from 'next/navigation';
import { Tenant } from '@/payload-types';
import { getNewsletterTranslation } from '@/_components/Newsletter/translations';

export const dynamic = 'force-dynamic';

export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string; subscriptionId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { domain, subscriptionId } = await params;
  const { success } = await searchParams;
  const subdomain = domain.split('.')[0];

  if (!subscriptionId) {
    redirect(`/${subdomain}/newsletter/error`);
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
      redirect(`/${subdomain}/newsletter/error`);
    }

    // Verify subdomain matches
    if (subscription.subdomain !== subdomain) {
      redirect(`/${subdomain}/newsletter/error`);
    }

    // Check if already unsubscribed or success query param is present
    if (subscription.status === 'unsubscribed' || success === 'true') {
      const tenant = subscription.tenant as Tenant;
      const tenantDoc = await payload.findByID({
        collection: 'tenants',
        id: tenant.id,
      });
      const topicName = tenantDoc.topicName;
      const chapelInfo = `${tenantDoc.type} ${tenantDoc.patron || ''} - ${tenantDoc.city}`;
      
      const t = (key: Parameters<typeof getNewsletterTranslation>[0]) => 
        getNewsletterTranslation(key, 'pl', 'unsubscribe');
      
      return (
        <NewsletterStatusPage
          variant="success"
          message={t('unsubscribeSuccessMessage')}
          chapelInfo={chapelInfo}
          subdomain={subdomain}
          locale="pl"
        />
      );
    }

    // Get tenant to get newsletter settings
    const tenant = subscription.tenant as Tenant;
    const tenantDoc = await payload.findByID({
      collection: 'tenants',
      id: tenant.id,
    });
    const contactListName = tenantDoc.mailingGroupId;
    const topicName = tenantDoc.topicName;

    if (!contactListName || !topicName) {
      return (
        <NewsletterStatusPage
          variant="warning"
          message="Ustawienia newslettera nie są skonfigurowane dla tej lokalizacji."
          subdomain={subdomain}
          locale="pl"
        />
      );
    }

    const t = (key: Parameters<typeof getNewsletterTranslation>[0]) => 
      getNewsletterTranslation(key, 'pl', 'unsubscribe');

    return (
      <NewsletterStatusPage
        variant="info"
        title={t('unsubscribeInfoTitle')}
        message="Jeśli chcesz wypisać się z subskrypcji ogłoszeń duszpasterskich, kliknij przycisk poniżej."
        subdomain={subdomain}
        locale="pl"
        showBackButton={false}
      >
        <UnsubscribeAction
          subscriptionId={subscription.id}
          email={subscription.email}
          topicName={topicName}
          subdomain={subdomain}
          locale="pl"
        />
      </NewsletterStatusPage>
    );
  } catch (error) {
    console.error('Error loading unsubscribe page:', error);
    redirect(`/${subdomain}/newsletter/error`);
  }
}


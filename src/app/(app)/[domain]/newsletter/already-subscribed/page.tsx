import { NewsletterStatusPage } from '@/_components/NewsletterStatusPage';

export const dynamic = 'force-dynamic';

export default async function AlreadySubscribedPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const subdomain = domain.split('.')[0];

  return (
    <NewsletterStatusPage
      subdomain={subdomain}
      title="Już jesteś zapisany"
      message="Ten adres email jest już zapisany do newslettera. Będziesz otrzymywać ogłoszenia duszpasterskie na swój adres email."
    />
  );
}


import { NewsletterStatusPage } from '@/_components/NewsletterStatusPage';

export const dynamic = 'force-dynamic';

export default async function ConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ warning?: string }>;
}) {
  const { domain } = await params;
  const { warning } = await searchParams;
  const subdomain = domain.split('.')[0];

  return (
    <NewsletterStatusPage
      subdomain={subdomain}
      title="Subskrypcja potwierdzona!"
      message="Dziękujemy! Twoja subskrypcja newslettera została potwierdzona. Będziesz otrzymywać ogłoszenia duszpasterskie na swój adres email."
      showWarning={warning === 'aws_error'}
    />
  );
}


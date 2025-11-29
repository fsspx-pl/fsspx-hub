import { fetchEventBySlug } from '@/_api/fetchEvent';
import { fetchTenants } from '@/_api/fetchTenants';
import { EventDetails } from '@/_components/EventDetails';
import { EventSignupForm } from '@/_components/EventSignupForm';
import { Gutter } from '@/_components/Gutter';
import { Breadcrumbs, BreadcrumbItem } from '@/_components/Breadcrumbs';
import { Alert } from '@/_components/Alert';
import { Media as MediaComponent } from '@/_components/Media';
import { Event, Tenant, Media } from '@/payload-types';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const tenants = await fetchTenants();
  // Note: Events are dynamic, so we can't pre-generate all paths
  // This is just for the structure
  return [];
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}) {
  const { domain, slug } = await params;
  
  const event = await fetchEventBySlug(domain, slug);

  if (!event) {
    notFound();
  }

  const tenant = typeof event.tenant === 'string' ? null : (event.tenant as Tenant);
  const form = typeof event.form === 'string' ? null : event.form;

  if (!form) {
    return (
      <Gutter className="py-8">
        <Alert variant="error" title="Błąd" message="Formularz nie został znaleziony." />
      </Gutter>
    );
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Strona główna', href: '/' },
    { label: 'Wydarzenia', href: '/wydarzenia' },
    { label: event.title, href: `/wydarzenia/${slug}` },
  ];

  return (
    <>
      <Gutter className="mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </Gutter>
      
      {/* Hero image - full width, outside Gutter */}
      {event.heroImage && (
        <div className="w-full">
          <MediaComponent
            resource={event.heroImage as Media}
            fill
            className="relative w-full h-[200px] md:h-[300px]"
            imgClassName="object-cover w-full h-full"
            size="100vw"
          />
        </div>
      )}

      <Gutter className="py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <EventDetails event={event} tenant={tenant as Tenant} showHeroImage={false} />
          <EventSignupForm event={event} form={form} />
        </div>
      </Gutter>
    </>
  );
}


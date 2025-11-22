import { fetchLatestPage } from "@/_api/fetchPage";
import { fetchTenant, fetchTenants } from "@/_api/fetchTenants";
import { format, parseISO } from "date-fns";
import { redirect } from "next/navigation";
import { Gutter } from "@/_components/Gutter";
import { RichText } from "@/_components/RichText";
import { BreadcrumbItem } from "@/_components/Breadcrumbs";
import { PageLayout } from "@/_components/PageLayout";

export async function generateStaticParams() {
  const tenants = await fetchTenants();
  return tenants
    .filter((tenant) => tenant.domain)
    .map((tenant) => ({
      domain: tenant.domain,
    }));
}

export default async function RedirectToNewestPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  const tenant = await fetchTenant(domain);
  
  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Nie znaleziono kaplicy</h1>
          <p className="text-gray-600">Podana domena nie istnieje lub nie ma przypisanej kaplicy.</p>
        </div>
      </div>
    );
  }

  const displayPastoralAnnouncements = tenant.pastoralAnnouncements?.displayPastoralAnnouncements !== false;
  
  if (!displayPastoralAnnouncements) {
    const infoNote = tenant.pastoralAnnouncements?.infoNote;
    
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: "Kaplice",
        disabled: true,
      },
      {
        label: tenant.city,
        href: "",
      },
    ];
    
    return (
      <PageLayout breadcrumbs={breadcrumbs}>
        <Gutter className="mt-4 py-6 flex flex-col gap-8 lg:gap-12 lg:flex-row">
          {infoNote ? (
            <RichText 
              data={infoNote} 
              className="prose prose-lg max-w-none text-left prose-a:no-underline m-0"
            />
          ) : (
            <div className="prose prose-lg max-w-none">
              <p>Ogłoszenia duszpasterskie nie są obecnie dostępne.</p>
            </div>
          )}
        </Gutter>
      </PageLayout>
    );
  }
  
  const latestPost = await fetchLatestPage(domain);
  
  if (!latestPost?.createdAt) {
    return <div>No announcements found</div>;
  }
  if(!latestPost.period) return;
  const date = format(parseISO(latestPost.period.start), 'dd-MM-yyyy');
  redirect(`/ogloszenia/${date}`);
}

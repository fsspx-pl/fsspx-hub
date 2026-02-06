import { fetchLatestPage } from "@/_api/fetchPage";
import { fetchTenant, fetchTenants } from "@/_api/fetchTenants";
import { BreadcrumbItem } from "@/_components/Breadcrumbs";
import { Gutter } from "@/_components/Gutter";
import { NewsletterSignupForm } from "@/_components/Newsletter/NewsletterSignupForm";
import { PageLayout } from "@/_components/PageLayout";
import { RichText } from "@/_components/RichText";
import { fetchSettings } from "@/_api/fetchGlobals";
import { Settings, Tenant } from "@/payload-types";
import { getTenantTitlePrefix } from "@/utilities/getTenantTitlePrefix";
import { format, parseISO } from "date-fns";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata | null> {
  const { domain } = await params;
  const [subdomain] = domain.split(".");

  let settings: Settings | null = null;
  let tenant: Tenant | null = null;

  try {
    settings = await fetchSettings();
    tenant = await fetchTenant(subdomain);
  } catch (error) {
    console.error(error);
  }

  const titlePrefix = getTenantTitlePrefix(settings, tenant);
  if (!titlePrefix) return null;

  return {
    title: titlePrefix,
  };
}

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
    const canRenderNewsletterSignup = Boolean(tenant.domain);
    
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
    
    const navItems = tenant.navItems;
    
    return (
      <PageLayout breadcrumbs={breadcrumbs} navItems={navItems}>
        <Gutter className="mt-4 py-6 flex flex-wrap gap-8">
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

          {canRenderNewsletterSignup && (
            <NewsletterSignupForm
              className="flex-1"
              subdomain={tenant.domain as string}
            />
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

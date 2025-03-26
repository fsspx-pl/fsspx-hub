import { fetchSettings } from "@/_api/fetchGlobals";
import { fetchLatestPage } from "@/_api/fetchPage";
import { fetchTenant, fetchTenants } from "@/_api/fetchTenants";
import { BreadcrumbItem, Breadcrumbs } from "@/_components/Breadcrumbs";
import { Calendar, FeastWithMasses } from "@/_components/Calendar";
import { FeastDataProvider } from "@/_components/Calendar/context/FeastDataContext";
import { Gutter } from "@/_components/Gutter";
import { NewMediumImpact } from "@/_components/_heros/NewMediumImpact";
import { Media, Settings, Tenant, User } from "@/payload-types";
import { Metadata } from "next";
import { Page as PageType } from "@/payload-types";
import { getFeastsWithMasses } from "../../../common/getFeastsWithMasses";
import { formatAuthorName } from "../../../utilities/formatAuthorName";

export async function generateStaticParams() {
  const tenants = await fetchTenants();
  return tenants
    .filter((tenant) => tenant.domain)
    .map((tenant) => ({
      domain: tenant.domain,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata | null> {
  const domain = decodeURIComponent((await params).domain);
  const [subdomain] = domain.split(".");

  let settings: Settings | null = null;
  let tenant: Tenant | null = null;

  try {
    settings = await fetchSettings();
    tenant = await fetchTenant(subdomain);
  } catch (error) {
    console.error(error);
  }

  if (!tenant) return null;
  if (!settings?.copyright) return null;

  const copyright = settings?.copyright || "";
  const location = tenant
    ? `${tenant.city} - ${tenant.type} ${tenant.patron}`
    : "";
  const title = `${copyright} - ${location}`;
  return {
    title,
  };
}

export default async function SiteHomePage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const domain = decodeURIComponent((await params).domain);
  const [subdomain] = domain.split(".");
  const latestPost = await fetchLatestPage(subdomain);

  if (!latestPost?.content_html) return null;

  const tenant = latestPost.tenant ? latestPost.tenant as Tenant : null;
  const period = latestPost?.period ? latestPost.period as PageType['period'] : null;
  const feastsWithMasses: FeastWithMasses[] = period && tenant ? await getFeastsWithMasses(period, tenant) : [];
  const breadcrumbs: BreadcrumbItem[] = tenant ? getBreadcrumbs(tenant) : [];

  const user = latestPost.author ? latestPost.author as User : null;
  const author = formatAuthorName(user);
  const authorAvatar = user?.avatar 
    ? user.avatar as Media 
    : null;

  return (
    <div>
      <Gutter className="mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </Gutter>
      <NewMediumImpact
        image={tenant?.coverBackground as Media}
        title={latestPost.title}
        author={author}
        authorAvatar={authorAvatar}
        createdAt={latestPost.createdAt}
        updatedAt={latestPost.updatedAt}
      />
      <Gutter className="mt-4 py-6 flex flex-col gap-8 lg:gap-12 md:flex-row">
        <div className="md:order-2 self-center md:self-auto w-full md:w-auto md:basis-1/3">
          <FeastDataProvider
            initialFeasts={feastsWithMasses}
          >
            <Calendar />
          </FeastDataProvider>
        </div>
        <div
          className="overflow-auto flex-1 prose"
          dangerouslySetInnerHTML={{ __html: latestPost.content_html }}
        ></div>
      </Gutter>
    </div>
  );
}

function getBreadcrumbs(tenant: Tenant): BreadcrumbItem[] {
  return [
    {
      label: "Kaplice",
      href: "",
    },
    {
      label: tenant.city,
      href: "",
    },
  ];
}

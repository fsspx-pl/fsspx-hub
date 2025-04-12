import { fetchSettings } from "@/_api/fetchGlobals";
import { fetchLatestPage, fetchTenantPageByDate } from "@/_api/fetchPage";
import { fetchTenant, fetchTenants } from "@/_api/fetchTenants";
import { BreadcrumbItem, Breadcrumbs } from "@/_components/Breadcrumbs";
import { Calendar, FeastWithMasses } from "@/_components/Calendar";
import { FeastDataProvider } from "@/_components/Calendar/context/FeastDataContext";
import { Gutter } from "@/_components/Gutter";
import { NewMediumImpact } from "@/_components/_heros/NewMediumImpact";
import { Media, Page as PageType, Settings, Tenant, User } from "@/payload-types";
import { format, parse, parseISO } from "date-fns";
import { Metadata } from "next";
import { getFeastsWithMasses } from "../../../../../common/getFeastsWithMasses";
import { formatAuthorName } from "../../../../../utilities/formatAuthorName";

export async function generateStaticParams() {
  const tenants = await fetchTenants();
  const params = [];

  for (const tenant of tenants.filter((tenant) => tenant.domain)) {
    const latestPost = await fetchLatestPage(tenant.domain.split('.')[0]);
    if (latestPost?.createdAt) {
      const date = format(new Date(latestPost.createdAt), 'dd-MM-yyyy');
      params.push({
        domain: tenant.domain,
        date: date,
      });
    }
  }
  
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; date: string }>;
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

export default async function AnnouncementPage({
  params,
}: {
  params: Promise<{ domain: string; date: string }>;
}) {
  const { domain, date } = await params;
  const isoDate = parse(date, 'dd-MM-yyyy', new Date()).toISOString();
  const latestPost = await fetchTenantPageByDate(domain, isoDate);

  if (!latestPost?.content_html) return null;

  const tenant = latestPost.tenant ? latestPost.tenant as Tenant : null;
  const period = latestPost?.period ? latestPost.period as PageType['period'] : null;
  const feastsWithMasses: FeastWithMasses[] = period && tenant ? await getFeastsWithMasses(period, tenant) : [];
  const breadcrumbs: BreadcrumbItem[] = tenant ? getBreadcrumbs(tenant, period?.start as string) : [];

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
        <div className="md:order-2 self-center md:self-auto w-full md:w-auto md:basis-1/3 justify-between">
          <FeastDataProvider
            initialFeasts={feastsWithMasses}
          >
            <Calendar />
          </FeastDataProvider>
        </div>
        <div
          className="overflow-auto flex-1 prose max-w-none text-justify md:text-left"
          dangerouslySetInnerHTML={{ __html: latestPost.content_html }}
        ></div>
      </Gutter>
    </div>
  );
}

function getBreadcrumbs(tenant: Tenant, date: string): BreadcrumbItem[] {
  return [
    {
      label: "Kaplice",
      href: "",
    },
    {
      label: tenant.city,
      href: "",
    },
    {
      label: "Ogłoszenia",
      href: "",
    },
    {
      label: format(parseISO(date), 'dd.MM.yyyy'),
      href: "",
    },
  ];
} 
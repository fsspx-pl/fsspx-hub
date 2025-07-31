import { fetchSettings } from "@/_api/fetchGlobals";
import { fetchLatestPage, fetchTenantPageByDate } from "@/_api/fetchPage";
import { fetchTenant, fetchTenants } from "@/_api/fetchTenants";
import { BreadcrumbItem, Breadcrumbs } from "@/_components/Breadcrumbs";
import { Calendar, FeastWithMasses } from "@/_components/Calendar";
import { FeastDataProvider } from "@/_components/Calendar/context/FeastDataContext";
import { Gutter } from "@/_components/Gutter";
import { NewMediumImpact } from "@/_components/_heros/NewMediumImpact";
import { RichText } from "@/_components/RichText";

import { Media, Page as PageType, Settings, Tenant, User } from "@/payload-types";
import { format, parse, parseISO, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Metadata } from "next";
import { getFeastsWithMasses } from "../../../../../../common/getFeastsWithMasses";
import { formatAuthorName } from "../../../../../../utilities/formatAuthorName";
import { SenderForm, SenderScript } from "../SenderForm";



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
  const now = new Date(); 
  const { domain, date } = await params;
  const isoDate = parse(date, 'dd-MM-yyyy', now).toISOString();
  const page = await fetchTenantPageByDate(domain, isoDate);
  const serverNow = now.toISOString();

  if (!page?.content) return null;

  const tenant = page.tenant ? page.tenant as Tenant : null;
  const period = page?.period ? page.period as PageType['period'] : null;

  // Calculate the date range for initial data fetch
  const currentDate = parseISO(isoDate);
  const prevMonth = startOfMonth(subMonths(currentDate, 1));
  const nextMonth = endOfMonth(addMonths(currentDate, 1));

  // Fetch feasts for the entire year
  const feastsWithMasses: FeastWithMasses[] = tenant 
    ? await getFeastsWithMasses(
        {
          start: new Date(currentDate.getFullYear(), 0, 1).toISOString(), // Start of year
          end: new Date(currentDate.getFullYear(), 11, 31).toISOString(), // End of year
        },
        tenant,
        now,
        {
          servicesStart: prevMonth.toISOString(),
          servicesEnd: nextMonth.toISOString(),
        }
      ) 
    : [];

  // Filter feasts for the current period
  const periodStart = period?.start ? parseISO(period.start) : currentDate;
  const periodEnd = period?.end ? parseISO(period.end) : currentDate;
  const periodFeasts = feastsWithMasses.filter(feast => {
    const feastDate = typeof feast.date === 'string' ? parseISO(feast.date) : feast.date;
    return feastDate >= periodStart && feastDate <= periodEnd;
  });

  // Regular page rendering
  const breadcrumbs: BreadcrumbItem[] = tenant ? getBreadcrumbs(tenant, page.title, period?.start as string) : [];

  const user = page.author ? page.author as User : null;
  const author = formatAuthorName(user);
  const authorAvatar = user?.avatar 
    ? user.avatar as Media 
    : null;



  return (
    <>
      <SenderScript accountId="f511ddc3f98190" formId="b82BgW" />
      <Gutter className="mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </Gutter>
      <NewMediumImpact
        image={tenant?.coverBackground as Media}
        title={page.title}
        author={author}
        authorAvatar={authorAvatar}
        createdAt={page.createdAt}
        updatedAt={page.updatedAt}
      />
      <Gutter className="mt-4 py-6 flex flex-col gap-8 lg:gap-12 lg:flex-row">
        <div className="lg:order-2 self-center lg:self-auto w-full lg:w-auto lg:basis-full justify-between">
          <FeastDataProvider
            initialFeasts={feastsWithMasses}
            initialDate={feastsWithMasses.length > 0 ? now.toISOString() : serverNow}
            tenantId={tenant?.id ?? ''}
          >
            <Calendar />
          </FeastDataProvider>
        </div>
        <div>
          <div className="overflow-auto flex-1 prose prose-lg max-w-none text-left">
            <RichText data={page.content} />
          </div>

          {process.env.NODE_ENV === 'production' && (
            <SenderForm formId="b82BgW" />
          )}
        </div>
      </Gutter>
    </>
  );
}

function getBreadcrumbs(tenant: Tenant, title: string, date: string): BreadcrumbItem[] {
  return [
    {
      label: "Kaplice",
      disabled: true,
    },
    {
      label: tenant.city,
      href: "..",
    },
    {
      label: "Ogłoszenia",
      href: "..",
    },
    {
      label: `${title} (${format(parseISO(date), 'dd.MM.yyyy')})`,
      href: "",
    },
  ];
} 
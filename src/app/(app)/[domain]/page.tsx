import { fetchSettings } from "@/_api/fetchGlobals";
import { fetchLatestPage } from "@/_api/fetchPage";
import { fetchTenant, fetchTenants } from "@/_api/fetchTenants";
import { BreadcrumbItem, Breadcrumbs } from "@/_components/Breadcrumbs";
import { Calendar, FeastWithMasses } from "@/_components/Calendar";
import { FeastDataProvider } from "@/_components/Calendar/context/FeastDataContext";
import { Gutter } from "@/_components/Gutter";
import { NewMediumImpact } from "@/_components/_heros/NewMediumImpact";
import { Feast } from "@/feast";
import { Media, Settings, Tenant, User } from "@/payload-types";
import { isSameDay, parseISO, startOfWeek } from "date-fns";
import { Metadata } from "next";
import { getFeasts } from "./getFeasts";
import { getServices } from "./getMasses";

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
  params: { domain: string };
}): Promise<Metadata | null> {
  const domain = decodeURIComponent(params.domain);
  const [subdomain] = domain.split(".");

  let settings: Settings | null = null;
  let tenant: Tenant | null = null;

  try {
    settings = await fetchSettings();
    tenant = await fetchTenant(subdomain);
  } catch (error) {
    console.error(error);
  }

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
  params: { domain: string };
}) {
  const domain = decodeURIComponent(params.domain);
  const [subdomain] = domain.split(".");
  const latestPost = await fetchLatestPage(subdomain);

  if (!latestPost.content_html) return null;

  const tenant = latestPost.tenant as Tenant;
  const start = startOfWeek(parseISO(latestPost.period.start as string), { weekStartsOn: 0 });
  const end = parseISO(latestPost.period.end);
  const feasts = await getFeasts(start, end);
  const masses = await getServices(
    tenant.id,
    start.toISOString(),
    end.toISOString()
  );

  const feastsWithMasses: FeastWithMasses[] = feasts.map((feast: Feast) => {
    const feastMasses = masses.filter((mass) => {
      const massDate = parseISO(mass.time);
      return isSameDay(massDate, feast.date);
    });
    return {
      ...feast,
      masses: feastMasses,
    };
  });

  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: "Kaplice",
      href: "",
    },
    {
      label: (latestPost.tenant as Tenant).city,
      href: "",
    },
  ];

  const user = latestPost.author as User;

  const author = user
    ? `${user.salutation === 'father' ? 'Ks.' : ''} ${user.firstName} ${user.lastName}`.trim()
    : undefined;

  return (
    <div>
      <Gutter className="mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </Gutter>
      <NewMediumImpact
        image={tenant.coverBackground as Media}
        title={latestPost.title}
        author={author}
        authorAvatar={user.avatar as Media}
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

import { fetchLatestPage, fetchTenantPageByDate } from "@/_api/fetchPage";
import { fetchTenant, fetchTenants } from "@/_api/fetchTenants";
import { FeastWithMasses } from "@/_components/Calendar";
import { garamond } from "@/fonts";
import { Page as PageType, Tenant } from "@/payload-types";
import { format, parse, parseISO } from "date-fns";
import { Metadata } from "next";
import { getFeastsWithMasses } from "../../../../../../../common/getFeastsWithMasses";
import { PrintableAnnouncements } from "../../PrintableAnnouncements";
import { enhanceFirstLetterInContent } from "../../enhanceFirstLetterInContent";

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

  let tenant: Tenant | null = null;

  try {
    tenant = await fetchTenant(subdomain);
  } catch (error) {
    console.error(error);
  }

  if (!tenant) return null;

  const location = `${tenant.city} - ${tenant.type} ${tenant.patron}`;
  const title = `Ogłoszenia do druku - ${location}`;
  
  return {
    title,
    robots: 'noindex, nofollow',
  };
}

export default async function PrintPage({
  params,
}: {
  params: Promise<{ domain: string; date: string }>;
}) {
  const now = new Date(); 
  const { domain, date } = await params;
  const isoDate = parse(date, 'dd-MM-yyyy', now).toISOString();
  const page = await fetchTenantPageByDate(domain, isoDate);

  if (!page?.content_html) return null;

  const enhancedContentHtml = enhanceFirstLetterInContent(page.content_html, garamond);

  const tenant = page.tenant ? page.tenant as Tenant : null;
  const period = page?.period ? page.period as PageType['period'] : null;

  if(!period?.start) return null;
  if(!period?.end) return null;


  // Fetch feasts only for the pastoral announcement period
  const periodFeasts: FeastWithMasses[] = tenant 
    ? await getFeastsWithMasses(
        {
          start: period?.start,
          end: period?.end,
        },
        tenant,
        now,
        {
          servicesStart: period?.start,
          servicesEnd: period?.end,
        }
      ) 
    : [];

  return (
    <PrintableAnnouncements
      title={page.title}
      content_html={enhancedContentHtml}
      feastsWithMasses={periodFeasts}
      tenant={tenant}
    />
  );
} 
import { fetchPageById } from "@/_api/fetchPage";
import { fetchTenant } from "@/_api/fetchTenants";
import { FeastWithMasses } from "@/_components/Calendar";

import { Page as PageType, Tenant } from "@/payload-types";
import { parse } from "date-fns";
import { Metadata } from "next";
import { getFeastsWithMasses } from "../../../../../../../common/getFeastsWithMasses";
import { PrintableAnnouncements } from "./PrintableAnnouncements";
import { checkPrintAccess } from "@/utilities/checkPrintAccess";
import { fetchPageAttachments } from "@/utilities/fetchPageAttachments";

// Force dynamic rendering since we use headers() for authentication
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; id: string }>;
}): Promise<Metadata | null> {
  const { domain, id } = await params;

  let tenant: Tenant | null = null;

  try {
    tenant = await fetchTenant(domain);
  } catch (error) {
    console.error(error);
  }

  if (!tenant) return null;

  const displayPastoralAnnouncements = tenant.pastoralAnnouncements?.displayPastoralAnnouncements !== false;
  if (!displayPastoralAnnouncements) return null;

  const location = `${tenant.city} - ${tenant.type} ${tenant.patron}`;
  const title = `Ogłoszenia do druku - ${location}`;
  
  return {
    title,
    robots: 'noindex, nofollow',
  };
}

export default async function PrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string; id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { domain, id } = await params;
  const { token } = await searchParams;
  
  // Domain param from middleware rewrite is just the subdomain (e.g., "poznan")
  // But fetchTenant expects exact match, so we need to handle the domain format
  // Try the domain as-is first (in case it's the full domain)
  let tenant = await fetchTenant(domain);
  
  // If not found, extract subdomain and try again
  // This handles cases where domain might be "poznan.localhost" or just "poznan"
  if (!tenant) {
    const [subdomain] = domain.split(".");
    if (subdomain !== domain) {
      tenant = await fetchTenant(subdomain);
    }
  }
  if (!tenant) {
    const { notFound } = await import('next/navigation');
    notFound();
  }

  const displayPastoralAnnouncements = tenant.pastoralAnnouncements?.displayPastoralAnnouncements !== false;
  if (!displayPastoralAnnouncements) {
    const { notFound } = await import('next/navigation');
    notFound();
  }

  // Print pages are back-office only - require authentication for all access
  const fullDomain = tenant.domain;
  const isAuthenticated = await checkPrintAccess(fullDomain, token);
  
  if (!isAuthenticated) {
    const { notFound } = await import('next/navigation');
    notFound();
  }

  // Authenticated users can see both drafts and published pages
  const page = await fetchPageById(id);

  if (!page || !page.content) {
    const { notFound } = await import('next/navigation');
    notFound();
  }

  // TypeScript doesn't understand that notFound() throws, use non-null assertion
  const validPage = page!;

  // Verify it's a pastoral announcements page
  if (validPage.type !== 'pastoral-announcements') {
    const { notFound } = await import('next/navigation');
    notFound();
  }

  // Verify the page belongs to the correct tenant
  const pageTenant = validPage.tenant ? (typeof validPage.tenant === 'string' ? null : validPage.tenant as Tenant) : null;
  
  if (!pageTenant || pageTenant.id !== tenant.id) {
    const { notFound } = await import('next/navigation');
    notFound();
  }

  const period = validPage.period ? validPage.period as PageType['period'] : null;

  if(!period?.start || !period?.end) return null;

  // Parse the period start date for feast calculations
  const parsedDate = parse(period.start, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", new Date());

  // Fetch feasts only for the pastoral announcement period
  // pageTenant is guaranteed to be non-null after the check above
  const periodFeasts: FeastWithMasses[] = await getFeastsWithMasses(
    {
      start: period.start,
      end: period.end,
    },
    pageTenant!,
    parsedDate,
    {
      servicesStart: period.start,
      servicesEnd: period.end,
    }
  );

  // Fetch attachments and display settings
  const { attachments, attachmentDisplay } = await fetchPageAttachments(validPage);

  return (
    <PrintableAnnouncements
      title={validPage.title}
      content={validPage.content}
      feastsWithMasses={periodFeasts}
      tenant={pageTenant}
      attachments={attachments}
      attachmentDisplay={attachmentDisplay}
    />
  );
}


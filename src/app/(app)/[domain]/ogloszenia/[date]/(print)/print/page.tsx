import { fetchTenantPageByDate } from "@/_api/fetchPage";
import { fetchTenant } from "@/_api/fetchTenants";
import { FeastWithMasses } from "@/_components/Calendar";
import { Page as PageType, Tenant } from "@/payload-types";
import { parse, isValid } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeastsWithMasses } from "../../../../../../../common/getFeastsWithMasses";
import { PrintableAnnouncements } from "@/app/(app)/[domain]/ogloszenia/(print)/print/[id]/PrintableAnnouncements";
import { fetchPageAttachments } from "@/utilities/fetchPageAttachments";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; date: string }>;
}): Promise<Metadata | null> {
  const { domain } = await params;

  let tenant = await fetchTenant(domain);
  if (!tenant) {
    const [subdomain] = domain.split(".");
    if (subdomain && subdomain !== domain) {
      tenant = await fetchTenant(subdomain);
    }
  }

  if (!tenant) return null;

  const displayPastoralAnnouncements =
    tenant.pastoralAnnouncements?.displayPastoralAnnouncements !== false;
  if (!displayPastoralAnnouncements) return null;

  const location = `${tenant.city} - ${tenant.type} ${tenant.patron}`;
  const title = `Ogłoszenia do druku - ${location}`;

  return {
    title,
    robots: "noindex, nofollow",
  };
}

export default async function PrintByDatePage({
  params,
}: {
  params: Promise<{ domain: string; date: string }>;
}) {
  const { domain, date } = await params;

  // Middleware provides the subdomain in `domain`, but handle both formats defensively.
  let tenant = await fetchTenant(domain);
  if (!tenant) {
    const [subdomain] = domain.split(".");
    if (subdomain && subdomain !== domain) {
      tenant = await fetchTenant(subdomain);
    }
  }

  if (!tenant) notFound();

  const displayPastoralAnnouncements =
    tenant.pastoralAnnouncements?.displayPastoralAnnouncements !== false;
  if (!displayPastoralAnnouncements) notFound();

  const parsedDate = parse(date, "dd-MM-yyyy", new Date());
  if (!isValid(parsedDate)) notFound();

  const isoDate = parsedDate.toISOString();
  const page = await fetchTenantPageByDate(domain, isoDate);
  if (!page?.content) notFound();

  const pageTenant = (page.tenant ? (page.tenant as Tenant) : null) as Tenant | null;
  const period = (page.period ? (page.period as PageType["period"]) : null) as
    | PageType["period"]
    | null;

  if (!period?.start || !period?.end) return null;

  const periodFeasts: FeastWithMasses[] = pageTenant
    ? await getFeastsWithMasses(
        {
          start: period.start,
          end: period.end,
        },
        pageTenant,
        parsedDate,
        {
          servicesStart: period.start,
          servicesEnd: period.end,
        }
      )
    : [];

  const { attachments, attachmentDisplay } = await fetchPageAttachments(page);

  return (
    <PrintableAnnouncements
      title={page.title}
      content={page.content}
      feastsWithMasses={periodFeasts}
      tenant={pageTenant}
      attachments={attachments}
      attachmentDisplay={attachmentDisplay}
    />
  );
}


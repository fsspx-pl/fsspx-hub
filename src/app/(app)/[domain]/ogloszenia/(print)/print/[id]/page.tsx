import { fetchPageById } from "@/_api/fetchPage";
import { fetchTenant, fetchTenants } from "@/_api/fetchTenants";
import { FeastWithMasses } from "@/_components/Calendar";

import { Page as PageType, Tenant } from "@/payload-types";
import { parse } from "date-fns";
import { Metadata } from "next";
import { getFeastsWithMasses } from "../../../../../../../common/getFeastsWithMasses";
import { PrintableAnnouncements } from "./PrintableAnnouncements";
import { checkPrintAccess } from "@/utilities/checkPrintAccess";


export async function generateStaticParams() {
  const tenants = await fetchTenants();
  const params = [];

  for (const tenant of tenants.filter((tenant) => tenant.domain)) {
    // Extract subdomain - middleware rewrites to /${subdomain}/path
    // So the [domain] param will be just the subdomain
    const subdomain = tenant.domain.split('.')[0];
    const { getPayload } = await import('payload');
    const configPromise = await import('@payload-config');
    const payload = await getPayload({
      config: configPromise.default,
    });
    
    const pages = await payload.find({
      collection: 'pages',
      where: {
        and: [
          {
            ['tenant.domain']: {
              contains: subdomain,
            },
          },
          {
            type: {
              equals: 'pastoral-announcements',
            },
          },
        ],
      },
      limit: 100,
      depth: 0,
    });

    for (const page of pages.docs) {
      if (page.id) {
        // Use subdomain for [domain] param since middleware rewrites to /${subdomain}/path
        params.push({
          domain: subdomain,
          id: page.id,
        });
      }
    }
  }
  
  return params;
}

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
}: {
  params: Promise<{ domain: string; id: string }>;
}) {
  const { domain, id } = await params;
  
  // #region agent log
  const fs = await import('fs/promises');
  await fs.appendFile('/Users/jacek/Projects/fsspx/hub/.cursor/debug.log', JSON.stringify({
    location: 'print/page.tsx:95',
    message: 'PrintPage called',
    data: { domain, id },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'B'
  }) + '\n').catch(() => {});
  // #endregion
  
  const tenant = await fetchTenant(domain);
  
  // #region agent log
  await fs.appendFile('/Users/jacek/Projects/fsspx/hub/.cursor/debug.log', JSON.stringify({
    location: 'print/page.tsx:98',
    message: 'After fetchTenant',
    data: { tenantFound: !!tenant, tenantId: tenant?.id, tenantDomain: tenant?.domain },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'C'
  }) + '\n').catch(() => {});
  // #endregion
  
  if (!tenant) {
    // #region agent log
    await fs.appendFile('/Users/jacek/Projects/fsspx/hub/.cursor/debug.log', JSON.stringify({
      location: 'print/page.tsx:106',
      message: 'Tenant not found - calling notFound()',
      data: { domain },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'C'
    }) + '\n').catch(() => {});
    // #endregion
    const { notFound } = await import('next/navigation');
    notFound();
  }

  const displayPastoralAnnouncements = tenant.pastoralAnnouncements?.displayPastoralAnnouncements !== false;
  if (!displayPastoralAnnouncements) {
    // #region agent log
    await fs.appendFile('/Users/jacek/Projects/fsspx/hub/.cursor/debug.log', JSON.stringify({
      location: 'print/page.tsx:115',
      message: 'Display pastoral announcements disabled - calling notFound()',
      data: { tenantId: tenant.id },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'D'
    }) + '\n').catch(() => {});
    // #endregion
    const { notFound } = await import('next/navigation');
    notFound();
  }

  // Only include drafts if user is authenticated and authorized (super admin or tenant admin)
  const fullDomain = tenant.domain;
  const canAccessDrafts = await checkPrintAccess(fullDomain);
  
  // #region agent log
  await fs.appendFile('/Users/jacek/Projects/fsspx/hub/.cursor/debug.log', JSON.stringify({
    location: 'print/page.tsx:125',
    message: 'Before fetchPageById',
    data: { id, canAccessDrafts, fullDomain },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'E'
  }) + '\n').catch(() => {});
  // #endregion
  
  const page = await fetchPageById(id, { includeDrafts: canAccessDrafts });

  // #region agent log
  await fs.appendFile('/Users/jacek/Projects/fsspx/hub/.cursor/debug.log', JSON.stringify({
    location: 'print/page.tsx:131',
    message: 'After fetchPageById',
    data: { pageFound: !!page, pageId: page?.id, pageStatus: page?._status, hasContent: !!page?.content },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'E'
  }) + '\n').catch(() => {});
  // #endregion

  if (!page || !page.content) {
    // #region agent log
    await fs.appendFile('/Users/jacek/Projects/fsspx/hub/.cursor/debug.log', JSON.stringify({
      location: 'print/page.tsx:139',
      message: 'Page not found or no content - calling notFound()',
      data: { pageFound: !!page, hasContent: !!page?.content },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'E'
    }) + '\n').catch(() => {});
    // #endregion
    const { notFound } = await import('next/navigation');
    notFound();
  }

  // TypeScript doesn't understand that notFound() throws, use non-null assertion
  const validPage = page!;

  // Verify it's a pastoral announcements page
  if (validPage.type !== 'pastoral-announcements') {
    // #region agent log
    await fs.appendFile('/Users/jacek/Projects/fsspx/hub/.cursor/debug.log', JSON.stringify({
      location: 'print/page.tsx:152',
      message: 'Page type mismatch - calling notFound()',
      data: { pageType: validPage.type },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'F'
    }) + '\n').catch(() => {});
    // #endregion
    const { notFound } = await import('next/navigation');
    notFound();
  }

  // Verify the page belongs to the correct tenant
  const pageTenant = validPage.tenant ? (typeof validPage.tenant === 'string' ? null : validPage.tenant as Tenant) : null;
  
  // #region agent log
  await fs.appendFile('/Users/jacek/Projects/fsspx/hub/.cursor/debug.log', JSON.stringify({
    location: 'print/page.tsx:162',
    message: 'Checking tenant match',
    data: { pageTenantId: pageTenant?.id, tenantId: tenant.id, matches: pageTenant?.id === tenant.id },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'run1',
    hypothesisId: 'G'
  }) + '\n').catch(() => {});
  // #endregion
  
  if (!pageTenant || pageTenant.id !== tenant.id) {
    // #region agent log
    await fs.appendFile('/Users/jacek/Projects/fsspx/hub/.cursor/debug.log', JSON.stringify({
      location: 'print/page.tsx:170',
      message: 'Tenant mismatch - calling notFound()',
      data: { pageTenantId: pageTenant?.id, tenantId: tenant.id },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'G'
    }) + '\n').catch(() => {});
    // #endregion
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

  return (
    <PrintableAnnouncements
      title={validPage.title}
      content={validPage.content}
      feastsWithMasses={periodFeasts}
      tenant={pageTenant}
    />
  );
}


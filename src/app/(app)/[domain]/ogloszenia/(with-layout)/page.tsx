import { fetchTenant } from "@/_api/fetchTenants";
import { fetchAnnouncementsByMonth } from "@/_api/fetchAnnouncements";
import { BreadcrumbItem, Breadcrumbs } from "@/_components/Breadcrumbs";
import { Gutter } from "@/_components/Gutter";
import { Media as MediaComponent } from "@/_components/Media";
import { AnnouncementsPageClient } from "@/_components/AnnouncementList/AnnouncementsPageClient";
import { Media, Tenant, Page } from "@/payload-types";
import { Metadata } from "next";
import { getMonthFromParams } from "./utils";
import { garamond } from "@/fonts";

// Always fetch data dynamically - users can navigate to any month
export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching, always fresh data

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<URLSearchParams>;
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

  const searchParamsData = await searchParams;
  const { year, month } = getMonthFromParams(searchParamsData);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('pl-PL', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  const location = `${tenant.general.city} - ${tenant.general.type} ${tenant.general.patron}`;
  const title = `Ogłoszenia duszpasterskie ${monthName} - ${location}`;
  const description = `Ogłoszenia duszpasterskie z ${monthName} z ${location}. Przeglądaj ogłoszenia parafialne i informacje duszpasterskie.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function AnnouncementsListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<URLSearchParams>;
}) {
  const { domain } = await params;
  const [subdomain] = domain.split(".");
  
  const tenant = await fetchTenant(subdomain);
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

  const searchParamsData = await searchParams;
  const { year, month } = getMonthFromParams(searchParamsData);
  let announcements: Page[];
  
  try {
    announcements = await fetchAnnouncementsByMonth(subdomain, year, month);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    announcements = [];
  }

  // Create breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: "Kaplice",
      disabled: true,
    },
    {
      label: tenant.general.city,
      href: "..",
    },
    {
      label: "Ogłoszenia",
      href: "",
    },
  ];

  return (
    <>
      <Gutter className="mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </Gutter>
      
      <Gutter className="flex flex-col gap-4">
        <div className="relative h-[200px] md:h-[348px]">
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <MediaComponent 
              resource={tenant.general.coverBackground as Media}
              fill
            />
          </div>
          <div className="relative h-full flex flex-col justify-end">
            <div className="prose prose-lg max-w-none bg-gradient-to-b from-transparent to-white to-70% pt-24">
              <h1 className={`${garamond.className} text-gray-700`}>
                Ogłoszenia duszpasterskie
              </h1>
            </div>
          </div>
        </div>
      </Gutter>
      
      <Gutter className="mt-4 py-6 w-full md:w-2/3 2xl:w-3/5">
        <AnnouncementsPageClient
          announcements={announcements}
          currentYear={year}
          currentMonth={month}
          domain={subdomain}
        />
      </Gutter>
    </>
  );
} 
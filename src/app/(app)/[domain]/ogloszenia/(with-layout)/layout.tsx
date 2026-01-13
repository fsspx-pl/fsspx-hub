import { PageLayout } from "@/_components/PageLayout";
import { fetchTenant } from "@/_api/fetchTenants";

export default async function AnnouncementLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}>) {
  let navItems = null;
  
  try {
    const { domain } = await params;
    const [subdomain] = domain.split('.');
    const tenant = await fetchTenant(subdomain);
    navItems = (tenant as any)?.navItems;
  } catch (error) {
    // Silently fail - navItems are optional
  }

  return (
    <PageLayout navItems={navItems}>
      {children}
    </PageLayout>
  );
} 
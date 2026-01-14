import { Footer } from "@/_components/Footer";
import { Header } from "@/_components/Header";
import { fetchTenant } from "@/_api/fetchTenants";

export default async function EventsLayout({
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
    <>
      <Header navItems={navItems} />
      {children}
      <Footer />
    </>
  );
}


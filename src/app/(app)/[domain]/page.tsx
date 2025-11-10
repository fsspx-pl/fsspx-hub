import { fetchLatestPage } from "@/_api/fetchPage";
import { fetchTenants } from "@/_api/fetchTenants";
import { format, parseISO } from "date-fns";
import { redirect } from "next/navigation";

export async function generateStaticParams() {
  const tenants = await fetchTenants();
  return tenants
    .filter((tenant) => tenant.general.domain)
    .map((tenant) => ({
      domain: tenant.general.domain,
    }));
}

export default async function RedirectToNewestPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  
  const latestPost = await fetchLatestPage(domain);
  
  if (!latestPost?.createdAt) {
    return <div>No announcements found</div>;
  }
  if(!latestPost.period) return;
  const date = format(parseISO(latestPost.period.start), 'dd-MM-yyyy');
  redirect(`/ogloszenia/${date}`);
}

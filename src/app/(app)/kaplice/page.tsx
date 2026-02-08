import { fetchTenants } from "@/_api/fetchTenants";
import { BreadcrumbItem } from "@/_components/Breadcrumbs";
import { PageLayout } from "@/_components/PageLayout";
import { Tenant } from "@/payload-types";
import { Metadata } from "next";
import { KapliceView } from "./KapliceView";

export const metadata: Metadata = {
  title: "Kaplice w Polsce",
  description: "Lista kaplic i misji FSSPX w Polsce",
};

export default async function KaplicePage() {
  const tenants = await fetchTenants();

  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: "Kaplice",
      disabled: true,
    },
  ];

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <KapliceView tenants={tenants} />
    </PageLayout>
  );
}

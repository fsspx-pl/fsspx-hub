import { fetchLatestPage } from "@/_api/fetchPage"
import { fetchTenants } from "@/_api/fetchTenants"
import { Gutter } from "@/_components/Gutter"

export async function generateStaticParams() {
  const tenants = (await fetchTenants())
  return tenants
    .filter(tenant => tenant.domains?.length)
    .map(tenant => ({
    domain: tenant.domains?.[0].domain,
  })
)
}

export default async function SiteHomePage({ params }: { params: { domain: string } }) {
  const domain = decodeURIComponent(params.domain)
  const subdomain = domain.split('.')[0]
  const latestPost = await fetchLatestPage(subdomain)
  return (
    <Gutter>
      <p>${JSON.stringify(latestPost)}</p>
    </Gutter>
  )
}

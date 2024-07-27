import { fetchLatestPage } from "@/_api/fetchPage"
import { fetchTenants } from "@/_api/fetchTenants"
import { Gutter } from "@/_components/Gutter"
import { MediumImpactHero } from "@/_components/_heros/MediumImpact"
import { Media, Tenant } from "@/payload-types"

export async function generateStaticParams() {
  const tenants = (await fetchTenants())
  return tenants
    .filter(tenant => tenant.domain)
    .map(tenant => ({
      domain: tenant.domain,
  })
)
}

export default async function SiteHomePage({ params }: { params: { domain: string } }) {
  const domain = decodeURIComponent(params.domain)
  const subdomain = domain.split('.')[0]
  const latestPost = await fetchLatestPage(subdomain)

  if(!latestPost.content_html) return null

  const tenant = latestPost.tenant as Tenant

  return (
    <>
      <MediumImpactHero media={tenant.coverBackground as Media} />
      <Gutter className="py-6">
        <div className="text-justify flex flex-col gap-4" dangerouslySetInnerHTML={{ __html: latestPost.content_html }}></div>
      </Gutter>
    </>
  )
}

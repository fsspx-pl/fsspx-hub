import { fetchSettings } from "@/_api/fetchGlobals"
import { fetchLatestPage } from "@/_api/fetchPage"
import { fetchTenant, fetchTenants } from "@/_api/fetchTenants"
import { Gutter } from "@/_components/Gutter"
import { MediumImpactHero } from "@/_components/_heros/MediumImpact"
import { Media, Settings, Tenant } from "@/payload-types"
import Head from "next/head"

export async function generateStaticParams() {
  const tenants = (await fetchTenants())
  return tenants
    .filter(tenant => tenant.domain)
    .map(tenant => ({
      domain: tenant.domain,
  })
)
}

export async function generateMetadata({ params }: { params: { domain: string } }) {
  const domain = decodeURIComponent(params.domain)
  const [ subdomain ] = domain.split('.')

  let settings: Settings | null = null
  let tenant: Tenant | null = null

  try {
    settings = await fetchSettings()
    tenant = await fetchTenant(subdomain)
  } catch (error) {
    console.error(error)
  }

  if(!settings?.copyright) return null

  const copyright = settings?.copyright || ''
  const location = tenant ? `${tenant.city} - ${tenant.type} ${tenant.patron}` : ''
  const title = `${copyright} - ${location}`
  return {
    title,
  }
}

export default async function SiteHomePage({ params }: { params: { domain: string } }) {
  const domain = decodeURIComponent(params.domain)
  const [ subdomain ] = domain.split('.')
  const latestPost = await fetchLatestPage(subdomain)

  if(!latestPost.content_html) return null

  const tenant = latestPost.tenant as Tenant

  return (
    <>
      <MediumImpactHero media={tenant.coverBackground as Media} title={tenant.city} subtitle={`${tenant.type} ${tenant.patron}`} />
      <Gutter className="py-6">
        <div className="text-justify flex flex-col gap-4" dangerouslySetInnerHTML={{ __html: latestPost.content_html }}></div>
      </Gutter>
    </>
  )
}

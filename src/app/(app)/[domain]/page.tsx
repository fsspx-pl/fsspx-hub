import { fetchLatestDoc } from "@/_api/fetchDoc"
import db from "@/lib/db"

export async function generateStaticParams() {
  return db.map(site => ({
      domain: `${site.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
    })
  )
}

export default async function SiteHomePage({ params }: { params: { domain: string } }) {
  const domain = decodeURIComponent(params.domain)
  const latestPost = await fetchLatestDoc(domain)
  return (
    <>
      <span>{domain}</span>
      <p>${JSON.stringify(latestPost)}</p>
    </>
  )
}

// Dummy data to be replaced with your database
const hostnamesDB = [
  {
    name: 'This is Site 1',
    description: 'Subdomain + custom domain',
    subdomain: 'abc',
  },
  {
    name: 'This is Site 2',
    description: 'Subdomain only',
    subdomain: 'bbc',
  },
]

/**
 * Returns the data of the hostname based on its subdomain.
 *
 * This method is used by pages under middleware.ts
 */
export async function getHostnameDataBySubdomain(subdomain: string) {
  return hostnamesDB.find(item => item.subdomain === subdomain)
}

/**
 * Returns the paths for `getStaticPaths` based on the subdomain of every
 * available hostname.
 */
// @ts-ignore
export async function getSubdomainPaths() {
  // get all sites that have subdomains set up
  const subdomains = hostnamesDB.filter(item => item.subdomain)

  // build paths for each of the sites in the previous two lists
  return subdomains.map(item => {
    return { params: { site: item.subdomain } }
  })
}

export default hostnamesDB

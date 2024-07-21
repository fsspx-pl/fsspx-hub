import { Gutter } from '../Gutter'
import { Logo } from '../Logo'
import { Footer as FooterData, Media, Settings } from '@/payload-types'
import { fetchFooter, fetchSettings } from '@/_api/fetchGlobals'

export async function Footer() {
  let footer: FooterData | null = null
  let settings: Settings | null = null

  try {
    footer = await fetchFooter()
    settings = await fetchSettings()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  if (!footer) return null
  if (!settings) return null

  const navItems = footer?.navItems || []
  const slogan = footer.slogan || ''                   
  const copyright = settings?.copyright || ''

  return (
    <footer className="text-gray-600 body-font bg-gray-100">
      <Gutter className="py-24 flex md:items-center lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
        <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left flex flex-col gap-4">
          <a className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
            <Logo logo={settings.logo as Media} skipMainText />
          </a>
          <span className="text-sm">{slogan}</span>
          {/* <p className="mt-2 text-sm text-gray-500">{footer.slogan}</p> */}
        </div>
        <div className="flex-grow flex flex-wrap md:pl-20 -mb-10 md:mt-0 mt-10 md:text-left text-center justify-end">
          {/* <div className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="title-font font-medium text-gray-900 tracking-widest text-sm mb-3">
              CATEGORIES
            </h2>
            <nav className="list-none mb-10">
              <li>
                <a className="text-gray-600 hover:text-gray-800">First Link</a>
              </li>
              <li>
                <a className="text-gray-600 hover:text-gray-800">Second Link</a>
              </li>
              <li>
                <a className="text-gray-600 hover:text-gray-800">Third Link</a>
              </li>
              <li>
                <a className="text-gray-600 hover:text-gray-800">Fourth Link</a>
              </li>
            </nav>
          </div> */}
        </div>
      </Gutter>
      <div className="bg-gray-200">
        <Gutter className="py-2 flex flex-wrap flex-col sm:flex-row">
          <p className="text-gray-500 text-sm text-center sm:text-left">© 2024 - {copyright}</p>
        </Gutter>
      </div>
    </footer>
  )
}

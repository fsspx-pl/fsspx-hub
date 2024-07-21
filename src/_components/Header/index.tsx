import { Header as HeaderData, Media, Settings } from '../../../payload/payload-types'
import { fetchHeader, fetchSettings } from '../../_api/fetchGlobals'
import { Gutter } from '../Gutter'
import { Logo } from '../Logo'
import { Menu } from './Menu'
import { HeaderNav } from './Nav'

export async function Header() {
  let header: HeaderData | null = null
  let settings: Settings | null = null

  try {
    header = await fetchHeader()
    settings = await fetchSettings()
  } catch (error) {
    // When deploying this template on Payload Cloud, this page needs to build before the APIs are live
    // So swallow the error here and simply render the header without nav items if one occurs
    // in production you may want to redirect to a 404  page or at least log the error somewhere
  }

  if (!header || !settings) return null

  return (
    <>
      <Gutter>
        <header className="flex flex-row justify-between items-center w-full py-4 lg:py-8">
          <Logo logo={settings.logo as Media} textLogo={header.textLogo as Media} />
          <div className="hidden md:block">
            <HeaderNav navItems={header.navItems} />
          </div>
          <Menu
            logo={settings.logo}
            textLogo={header.textLogo}
            copyright={settings.copyright}
            navItems={header.navItems}
          />
        </header>
      </Gutter>
    </>
  )
}

import { Header as HeaderData, Media, Settings } from '@/payload-types'
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
    // eslint-disable-next-line no-console
    console.error(error)
  }

  if (!header || !settings) return null

  return (
      <Gutter>
        <header className="flex flex-row justify-between items-center w-full py-4 lg:py-8">
          <Logo />
          <div className="hidden md:block">
            <HeaderNav navItems={header.navItems} />
          </div>
          <Menu
            copyright={settings.copyright}
            navItems={header.navItems}
          />
        </header>
      </Gutter>
  )
}

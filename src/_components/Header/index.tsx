import { Header as HeaderType, Settings } from '@/payload-types'
import { fetchSettings } from '../../_api/fetchGlobals'
import { Gutter } from '../Gutter'
import { Logo } from '../Logo'
import { Menu } from './Menu'
import { HeaderNav } from './Nav'

export async function Header({ navItems }: Pick<HeaderType, 'navItems'>) {
  let settings: Settings | null = null

  try {
    settings = await fetchSettings()
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  if (!settings) return null


  return (
      <Gutter>
        <header className="flex flex-row justify-between items-center w-full py-4 lg:py-8 bg-white dark:bg-[#2B2B2B]">
          <Logo />
          <div className="hidden md:block">
            <HeaderNav navItems={navItems} />
          </div>
          <Menu
            copyright={settings.copyright}
            navItems={navItems}
          />
        </header>
      </Gutter>
  )
}

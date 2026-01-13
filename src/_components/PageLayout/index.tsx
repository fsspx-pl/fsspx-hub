import { BreadcrumbItem, Breadcrumbs } from '../Breadcrumbs'
import { Footer } from '../Footer'
import { Gutter } from '../Gutter'
import { Header } from '../Header'
import { Header as HeaderType } from '@/payload-types'

interface PageLayoutProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  navItems?: HeaderType['navItems']
}

export async function PageLayout({ children, breadcrumbs, navItems }: PageLayoutProps) {
  return (
    <>
      <Header navItems={navItems} />
      {breadcrumbs && (
        <Gutter className="mb-4">
          <Breadcrumbs items={breadcrumbs} />
        </Gutter>
      )}
      {children}
      <Footer />
    </>
  )
}


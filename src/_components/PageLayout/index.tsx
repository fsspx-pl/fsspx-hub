import { Header } from '../Header'
import { Footer } from '../Footer'
import { BreadcrumbItem, Breadcrumbs } from '../Breadcrumbs'
import { Gutter } from '../Gutter'

interface PageLayoutProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export async function PageLayout({ children, breadcrumbs }: PageLayoutProps) {
  return (
    <>
      <Header />
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


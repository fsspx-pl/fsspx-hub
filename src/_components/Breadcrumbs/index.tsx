import React from 'react'
import Link from 'next/link'
import { Gothic_A1 } from 'next/font/google'

const gothicA1 = Gothic_A1({
  weight: '600',
  subsets: ['latin'],
})

type BreadcrumbItem = {
  label: string
  href: string
  isLast?: boolean
}

type Props = {
  items: BreadcrumbItem[]
}

const ChevronIcon = () => (
  <svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M5.57472 5.40639C5.66409 5.49181 5.71429 5.6076 5.71429 5.72833C5.71429 5.84906 5.66409 5.96485 5.57472 6.05027L0.802547 10.6061C0.712083 10.6865 0.592431 10.7303 0.468799 10.7283C0.345167 10.7262 0.227208 10.6784 0.139774 10.5949C0.0523392 10.5114 0.00225569 10.3988 7.43488e-05 10.2808C-0.00210699 10.1628 0.0437841 10.0485 0.12808 9.96217L4.56302 5.72833L0.12808 1.49449C0.0437841 1.40813 -0.00210699 1.2939 7.43488e-05 1.17587C0.00225569 1.05785 0.0523392 0.945238 0.139774 0.861768C0.227208 0.778299 0.345167 0.730486 0.468799 0.728403C0.592431 0.726321 0.712083 0.770131 0.802547 0.850605L5.57472 5.40639Z" fill="#7F8186"/>
  </svg>
)

export const Breadcrumbs: React.FC<Props> = ({ items }) => {
  return (
    <nav className={`flex items-center gap-2 ${gothicA1.className}`}>
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && <ChevronIcon />}
          <Link 
            href={item.href}
            className={`hover:underline ${item.isLast ? 'text-[#EB6265]' : 'text-[#7F8186]'}`}
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  )
} 
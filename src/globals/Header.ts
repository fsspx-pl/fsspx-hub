
import { GlobalConfig } from 'payload'
import link from '../fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  label: {
    pl: 'Nagłówek',
    en: 'Header',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      label: {
        en: 'Navigation Items',
        pl: 'Elementy nawigacji',
      },
      type: 'array',
      maxRows: 6,
      fields: [
        link({
          appearances: false,
        }),
      ],
    },
  ],
}

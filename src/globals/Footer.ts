
import { GlobalConfig } from 'payload'
import link from '../fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: {
    pl: 'Stopka',
    en: 'Footer',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slogan',
      label: {
        en: 'Slogan',
        pl: 'Slogan',
      },
      type: 'text',
    },
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

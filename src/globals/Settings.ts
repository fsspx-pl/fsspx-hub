import { GlobalConfig } from "payload";

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: {
    pl: 'Ogólne',
    en: 'General',
  },
  typescript: {
    interface: 'Settings',
  },
  graphQL: {
    name: 'Settings',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      label: {
        en: 'Logo',
        pl: 'Logo',
      },
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'copyright',
      label: {
        en: 'Copyright holder',
        pl: 'Prawa autorskie',
      },
      type: 'text',
    },
  ],
}

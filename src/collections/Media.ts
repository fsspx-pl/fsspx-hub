import { dirname } from 'path'
import { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: path.resolve(__dirname, '../../media'),
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      label: {
        en: 'Alt Text',
        pl: 'Tekst alternatywny',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      label: {
        en: 'Caption',
        pl: 'Opis',
      },
      type: 'richText',
    },
  ],
}

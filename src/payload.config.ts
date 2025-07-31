import { mongooseAdapter } from '@payloadcms/db-mongodb'
import {
  HTMLConverterFeature,
  lexicalEditor,
  convertLexicalToHTML,
} from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { pl } from '@payloadcms/translations/languages/pl'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { ServiceWeeks } from './collections/ServiceWeeks'
import { Services } from './collections/Services'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { Settings } from './globals/Settings'
import { garamond } from '@/fonts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    timezones: {
      defaultTimezone: 'Europe/Warsaw',
      supportedTimezones: [
        {
          label: 'Europe/Warsaw',
          value: 'Europe/Warsaw',
        },
      ],
    },
  },
  i18n: {
    fallbackLanguage: 'pl',
    supportedLanguages: { pl, en },
  },
  globals: [Settings, Header, Footer],
  collections: [Users, Tenants, Pages, Media, Services, ServiceWeeks],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
    connectOptions: {
      directConnection: process.env.DATABASE_DIRECT_CONNECTION === 'true',
      tls: process.env.DATABASE_TLS === 'true',
      tlsAllowInvalidCertificates: true,
    },
  }),
  sharp,
})

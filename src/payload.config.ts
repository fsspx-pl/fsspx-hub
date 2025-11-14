import { mongooseAdapter } from '@payloadcms/db-mongodb'
import {
  lexicalEditor,
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
import { NewsletterSubscriptions } from './collections/NewsletterSubscriptions'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { Settings } from './globals/Settings'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { newsletterSignupTranslations } from './_components/NewsletterSignupForm/translations'

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
    components: {
      graphics: {
        Logo: '@/_components/Logo/Icon/index.tsx#Icon',
        Icon: '@/_components/Logo/Icon/index.tsx#AdminIcon',
      }
    }
  },
  i18n: {
    fallbackLanguage: 'pl',
    supportedLanguages: { pl, en },
    translations: {
      pl: {
        ...pl,
        newsletterSignup: newsletterSignupTranslations,
      },
      en: {
        ...en,
        newsletterSignup: newsletterSignupTranslations,
      },
    },
  },
  globals: [Settings, Header, Footer],
  collections: [Users, Tenants, Pages, Media, Services, ServiceWeeks, NewsletterSubscriptions],
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
  email: nodemailerAdapter({
    defaultFromAddress: process.env.FROM_ADDRESS as string,
    defaultFromName: process.env.FROM_NAME as string,
    transportOptions: {
      host: process.env.SMTP_HOST as string,
      port: parseInt(process.env.SMTP_PORT as string),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
})

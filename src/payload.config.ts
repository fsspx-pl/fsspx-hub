import { mongooseAdapter } from '@payloadcms/db-mongodb'
import {
  HeadingFeature,
  defaultEditorFeatures,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { pl } from '@payloadcms/translations/languages/pl'
import path from 'path'
import { Field, buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { ServiceWeeks } from './collections/ServiceWeeks'
import { Services } from './collections/Services'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { NewsletterSubscriptions } from './collections/NewsletterSubscriptions'
import { Events } from './collections/Events'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { Settings } from './globals/Settings'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { newsletterTranslations } from './_components/Newsletter/translations'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { tenantOnlyAccess } from './access/byTenant'
import { revalidateEventPages } from './collections/Events/hooks/revalidateEventPages'

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
        newsletterSignup: newsletterTranslations,
      },
      en: {
        ...en,
        newsletterSignup: newsletterTranslations,
      },
    },
  },
  globals: [Settings, Header, Footer],
  collections: [Users, Tenants, Pages, Media, Services, ServiceWeeks, NewsletterSubscriptions, Events],
  plugins: [
    formBuilderPlugin({
      fields: {
        payment: false,
      },
      formOverrides: {
        hooks: {
          beforeChange: [
            async ({ data, req, operation }) => {
              // Inject tenant context if available
              if (req.user && operation === 'create') {
                const user = req.user as any;
                if (user.lastLoggedInTenant) {
                  const tenantId = typeof user.lastLoggedInTenant === 'string' 
                    ? user.lastLoggedInTenant 
                    : user.lastLoggedInTenant.id;
                  // Store tenant context in form metadata if needed
                  if (!data.meta) {
                    data.meta = {};
                  }
                  data.meta.tenant = tenantId;
                }
              }
              return data;
            },
          ],
          afterChange: [
            revalidateEventPages,
          ],
        },
      },
      formSubmissionOverrides: {
        access: {
          create: tenantOnlyAccess,
          read: tenantOnlyAccess,
          update: tenantOnlyAccess,
          delete: tenantOnlyAccess,
        },
        hooks: {
        },
      },
    }),
  ],
  editor: lexicalEditor({
    features: [
      ...defaultEditorFeatures,
      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3'] }),
    ],
  }),
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

import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { s3Storage } from '@payloadcms/storage-s3'
import {
  HeadingFeature,
  defaultEditorFeatures,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { pl } from '@payloadcms/translations/languages/pl'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { newsletterTranslations } from './_components/Newsletter/translations'
import { tenantOnlyAccess } from './access/byTenant'
import { Events } from './collections/Events'
import { revalidateEventPages } from './collections/Events/hooks/revalidateEventPages'
import { Media } from './collections/Media'
import { NewsletterSubscriptions } from './collections/NewsletterSubscriptions'
import { Pages } from './collections/Pages'
import { ServiceWeeks } from './collections/ServiceWeeks'
import { Services } from './collections/Services'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { Settings } from './globals/Settings'
import { anyone } from './access/anyone'

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
    s3Storage({
      collections: {
        media: {
          prefix: 'media', // Default prefix; Media documents can override via their prefix field
        },
      },
      bucket: process.env.AWS_S3_BUCKET as string,
      config: {
        credentials: {
          accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
        },
        region: process.env.AWS_S3_REGION as string,
      },
    }),
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
          create: anyone,
          read: tenantOnlyAccess,
          update: tenantOnlyAccess,
          delete: tenantOnlyAccess,
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

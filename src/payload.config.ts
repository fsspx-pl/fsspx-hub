import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { s3Storage } from '@payloadcms/storage-s3'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import {
  HeadingFeature,
  defaultEditorFeatures,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { pl } from '@payloadcms/translations/languages/pl'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
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
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) => realpath(value)?.endsWith(path.join('payload', 'bin.js')))
const isProduction = process.env.NODE_ENV === 'production'

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
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
  folders: {
    browseByFolder: false, // Disable global folder view - folders only work within Media collection
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
        region: process.env.AWS_REGION as string,
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
    importExportPlugin({
      collections: ['form-submissions'],
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
  db: sqliteD1Adapter({ binding: cloudflare.env.DB }),
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

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}

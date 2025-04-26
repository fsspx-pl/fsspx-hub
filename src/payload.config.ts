import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { HTMLConverterFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import path, { join } from 'path'
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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  globals: [ Settings, Header, Footer ],
  collections: [Users, Tenants, Pages, Media, Services, ServiceWeeks],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      // The HTMLConverter Feature is the feature which manages the HTML serializers.
      // If you do not pass any arguments to it, it will use the default serializers.
      HTMLConverterFeature({}),
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
      tlsCAFile: join(process.cwd(), process.env.DATABASE_TLS_CA_FILE ?? ''),
      tlsAllowInvalidCertificates: !!process.env.DATABASE_TLS_CA_FILE,
    },
  }),
  sharp,
})


import { CollectionConfig } from 'payload'
import { superAdmins } from '../../access/superAdmins'
import { anyone } from '@/access/anyone'
import { tenantAdmins } from '@/access/tenantAdmins'
import { location } from '@/fields/location'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: superAdmins,
    read: anyone,
    update: tenantAdmins,
    delete: superAdmins,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
    },
    ...location,
    {
      name: 'senderListId',
      type: 'text',
      label: 'Sender List ID',
      admin: {
        description: {
          pl: 'ID listy mailingowej w Sender.net. UWAGA: zmiana ID listy mailingowej wpłynie na odbiorców ogłoszeń dla tej lokalizacji.',
          en: 'The ID of the mailing list in Sender.net. NOTE: changing the mailing list ID will affect the newsletter recipients for this location.'
        }
      }
    },
  ],
}

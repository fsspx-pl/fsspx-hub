import { CollectionConfig } from 'payload'
import { superAdmins } from '../../access/superAdmins'
import { anyone } from '@/access/anyone'
import { tenantAdmins } from '@/access/tenantAdmins'
import { location } from '@/fields/location'
import serviceFields from '@/fields/service'

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
    {
      name: 'feastTemplates',
      type: 'group',
      fields: [
				{
					type: 'tabs',
					tabs: [
						{
							name: 'sunday',
							label: {
								pl: 'Niedziela',
								en: 'Sunday'
							},
							fields: [
                {
                  type: 'json',
                  name: 'applicableDays',
                  defaultValue: [0],
                  hidden: true,
                },
                {
                type: 'array',
                name: 'services',
                fields: [
                  ...Object.values(serviceFields),
                ]}
							],
              admin: {
                description: {
                  pl: 'Szablon nabożeństw na niedzielę. Ponisze nabożeństwa bedą tworzone automatycznie podczas tworzenia nowych tygodni.',
                  en: 'Template for Sunday services. These services will be automatically created for new service weeks.'
                }
              }
						},
						{
							name: 'otherDays',
							label: {
								pl: 'Dni powszednie',
								en: 'Other days'
							},
							fields: [
                {
                  type: 'json',
                  name: 'applicableDays',
                  defaultValue: [1, 2, 3, 4, 5, 6],
                  hidden: true,
                },
								{
                type: 'array',
                name: 'services',
                fields: [
                  ...Object.values(serviceFields),
                ]
              }
							],
							admin: {
								width: '50%',
                description: {
                  pl: 'Szablon nabożeństw na dni powszednie (poniedziałek-sobota). Ponisze nabożeństwa bedą tworzone automatycznie podczas tworzenia nowych tygodni.',
                  en: 'Template for weekday services (Monday-Saturday). These services will be automatically created for new service weeks.'
                }
							}
						}
					]
				}
      ]
    }
  ],
}

import { CollectionConfig } from 'payload'
import { superAdmins } from '../../access/superAdmins'
import { anyone } from '@/access/anyone'
import { tenantAdmins } from '@/access/tenantAdmins'
import { location } from '@/fields/location'
import serviceFields from '@/fields/service'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: {
    singular: {
      pl: 'Lokalizacja',
      en: 'Tenant',
    },
    plural: {
      pl: 'Lokalizacje',
      en: 'Tenants',
    },
  },
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
      label: {
        en: 'Name',
        pl: 'Nazwa',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'domain',
      label: {
        en: 'Subdomain',
        pl: 'Subdomena',
      },
      type: 'text',
      required: true,
    },
    ...location,
    {
      name: 'mailingGroupId',
      type: 'text',
      label: {
        en: 'Mailing Group ID',
        pl: 'ID Grupy Mailingowej',
      },
      admin: {
        description: {
          pl: 'ID grupy mailingowej w Mailerlite. UWAGA: zmiana ID grupy mailingowej wpłynie na odbiorców ogłoszeń dla tej lokalizacji.',
          en: 'The ID of the mailing group in Mailerlite. NOTE: changing the mailing group ID will affect the newsletter recipients for this location.'
        }
      }
    },
    {
      name: 'feastTemplates',
      label: {
        en: 'Feast Templates',
        pl: 'Szablony nabożeństw dla danego dnia tygodnia',
      },
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
                label: {
                  en: 'Services',
                  pl: 'Nabożeństwa',
                },
                fields: [
                  ...Object.values(serviceFields),
                ]}
							],
              admin: {
                description: {
                  pl: 'Szablon nabożeństw na niedzielę. Poniższe nabożeństwa zostaną utworzone automatycznie podczas utworzenia nowego Porządku Tygodniowego.',
                  en: 'Template for Sunday services. These services will be automatically created for new Week Order.'
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
                label: {
                  en: 'Services',
                  pl: 'Nabożeństwa',
                },
                fields: [
                  ...Object.values(serviceFields),
                ]
              }
							],
							admin: {
								width: '50%',
                description: {
                  pl: 'Szablon nabożeństw na dni powszednich (poniedziałek-sobota). Poniższe nabożeństwa zostaną utworzone automatycznie podczas utworzenia nowego Porządku Tygodniowego.',
                  en: 'Template for weekday services (Monday-Saturday). These services will be automatically created for new Week Order.'
                }
							}
						}
					]
				}
      ]
    }
  ],
}

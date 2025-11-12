import { anyone } from '@/access/anyone'
import { location } from '@/fields/location'
import serviceFields from '@/fields/service'
import { CollectionConfig } from 'payload'
import { superAdmins } from '../../access/superAdmins'
import { isSuperAdmin } from '@/utilities/isSuperAdmin'
import { checkTenantRoles } from '../Users/utilities/checkTenantRoles'
import { Tenant } from '@/payload-types'

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
    read: ({ req }) => {
      const { user } = req
      if (!user) return false
      if (isSuperAdmin(user)) return true
      if (!Array.isArray(user.tenants)) return false
      if (!user.tenants.length) return false

      const userTenantIds = user.tenants
        .map((t: any) => (typeof t.tenant === 'string' ? t.tenant : t.tenant?.id))
        .filter(Boolean)

      if (!userTenantIds.length) return false
      return {
        id: { in: userTenantIds }
      }
    },
    create: superAdmins,
    update: ({ req }) => {
      const { user } = req
      if (!user) return false
      if (isSuperAdmin(user)) return true
      if (!Array.isArray(user.tenants)) return false
      const adminTenantIds = user.tenants
        .filter((t: any) => checkTenantRoles(['admin'], user, t.tenant))
        .map((t: any) => (typeof t.tenant === 'string' ? t.tenant : t.tenant?.id))
        .filter(Boolean)
      if (!adminTenantIds.length) return false

      return {
        id: { in: adminTenantIds }
      }
    },
    delete: superAdmins,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['city', 'type', 'patron'],
  },
  fields: [
    {
      name: 'users',
      label: {
        pl: 'Użytkownicy tej lokalizacji',
        en: 'Users of this location'
      },
      type: 'join',
      collection: 'users',
      on: 'tenants.tenant',
      maxDepth: 2,
      access: {
        read: anyone
      },
      admin: {
        allowCreate: false,
      }
    },
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
        en: 'AWS SES Contact List Name',
        pl: 'Nazwa Listy Kontaktów AWS SES',
      },
      access: {
        read: superAdmins,
      },
      admin: {
        description: {
          pl: 'Nazwa listy kontaktów w AWS SES. UWAGA: zmiana nazwy listy kontaktów wpłynie na odbiorców ogłoszeń dla tej lokalizacji.',
          en: 'The name of the contact list in AWS SES. NOTE: changing the contact list name will affect the newsletter recipients for this location.'
        }
      }
    },
    {
      name: 'topicName',
      type: 'text',
      label: {
        en: 'AWS SES Topic Name',
        pl: 'Nazwa Tematu w AWS SES',
      },
      access: {
        read: superAdmins,
      },
      admin: {
        description: {
          pl: 'Nazwa tematu w AWS SES (np. poznan, warszawa). UWAGA: zmiana nazwy tematu wpłynie na odbiorców ogłoszeń dla tej lokalizacji.',
          en: 'The topic name in AWS SES (e.g. poznan, warszawa). NOTE: changing the topic name will affect the newsletter recipients for this location.'
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
                  admin: {
                    hidden: true,
                  },
                  type: 'json',
                  name: 'applicableDays',
                  defaultValue: [0],
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
                  admin: {
                    hidden: true,
                  },
                  type: 'json',
                  name: 'applicableDays',
                  defaultValue: [1, 2, 3, 4, 5, 6],
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

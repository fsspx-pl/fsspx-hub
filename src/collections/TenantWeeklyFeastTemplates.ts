import { tenantOnlyAccess, tenantReadOrPublic } from '@/access/byTenant'
import serviceFields from '@/fields/service'
import { CollectionConfig } from 'payload'
import { isGeneric } from './TenantWeeklyFeastTemplates/utilities/isGeneric'
import { DAY_TAB_NAMES, DAY_TABS_CONFIG } from '@/common/templates/dayTabs'

function hasServicesForDay(template: any, dayTab: string): boolean {
  const dayData = template?.[dayTab]
  return Array.isArray(dayData?.services) && dayData.services.length > 0
}

function rangesOverlap(
  aStart?: string | null,
  aEnd?: string | null,
  bStart?: string | null,
  bEnd?: string | null
): boolean {
  if (!aStart || !aEnd || !bStart || !bEnd) return false
  // inclusive range overlap check on ISO strings
  return !(aEnd < bStart || bEnd < aStart)
}

export const TenantWeeklyFeastTemplates: CollectionConfig = {
  slug: 'feastTemplates',
  labels: {
    singular: { en: 'Feast Template', pl: 'Szablon nabożeństw' },
    plural: { en: 'Feast Templates', pl: 'Szablony nabożeństw' },
  },
  access: {
    read: tenantReadOrPublic,
    create: tenantOnlyAccess,
    update: tenantOnlyAccess,
    delete: tenantOnlyAccess,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tenant', 'isGeneric', 'periodStart', 'periodEnd'],
    group: { en: 'Services', pl: 'Nabożeństwa' },
    description: {
      en: 'Define per-day service templates, optionally limited to a period. One generic template per day; dated templates must not overlap for the same days. Generic template (no period) is used when no period-based template applies.',
      pl: 'Zdefiniuj szablony nabożeństw dla dni tygodnia, opcjonalnie z okresem obowiązywania. Jeżeli zostanie dodany okres obowiązywania szablonu, to generowanie nabożeństw w Tygodniowych Porządkach Nabożeństw będzie odbywać się według tego szablonu tylko w  określonym niżej okresie. W okresach, które nie mają przypisanego żadnego Szablonu z okresem obowiązywania, zostanie użyty ogólny Szablon nabożeństw, a więc taki, który nie ma okresu obowiązywania (w tym polu zaznaczamy "Szablon ogólny (bez okresu obowiązywania)").',
    },
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      label: { en: 'Tenant', pl: 'Lokalizacja' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'isGeneric',
      type: 'checkbox',
      label: { en: 'Generic template (no period)', pl: 'Szablon ogólny (bez okresu obowiązywania)' },
      defaultValue: false,
      admin: {
        description: {
          en: 'Only one generic template per location. Used when no period-based template applies.',
          pl: 'Tylko jeden szablon ogólny na lokalizację. Używany, gdy nie ma szablonu z okresem.',
        },
      },
      validate: isGeneric,
    },
    {
      name: 'title',
      type: 'text',
      label: { en: 'Title', pl: 'Tytuł' },
      admin: {
        description: {
          en: 'Optional title to identify this template (e.g., "Lent", "Advent", "Regular")',
          pl: 'Opcjonalny tytuł do identyfikacji szablonu (np. "Wielki Post", "Adwent", "Regularny")',
        },
      },
    },
    {
        type: 'row',
        fields: [
          {
            name: 'periodStart',
            type: 'date',
            label: { en: 'Period start', pl: 'Początek okresu' },
            admin: { width: '50%' },
          },
          {
            name: 'periodEnd',
            type: 'date',
            label: { en: 'Period end', pl: 'Koniec okresu' },
            admin: { width: '50%' },
          },
        ],
        admin: {
          condition: (_, siblingData) => !siblingData.isGeneric,
        },
      },
    {
      type: 'tabs',
      tabs: DAY_TABS_CONFIG.map(({ name, label, dayNumber }) => ({
        name,
        label,
        fields: [
          {
            type: 'array',
            name: 'services',
            label: { en: 'Services', pl: 'Nabożeństwa' },
            fields: Object.values(serviceFields),
          },
        ],
      })),
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        const start = data?.periodStart as string | undefined
        const end = data?.periodEnd as string | undefined
        const isGeneric = Boolean(data?.isGeneric)
        if (isGeneric) {
          if (start || end) {
            throw new Error('Generic template cannot have a periodStart or periodEnd')
          }
        } else {
          if ((start && !end) || (!start && end)) {
            throw new Error('Both periodStart and periodEnd must be provided together')
          }
          if (start && end && start > end) {
            throw new Error('periodStart must be before or equal to periodEnd')
          }
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        const payload = req.payload
        const tenantId = typeof data?.tenant === 'string' ? data.tenant : data?.tenant?.id
        if (!tenantId) return data

        const thisId = operation === 'update' ? originalDoc?.id : undefined
        const isGeneric = Boolean(data?.isGeneric)

        const candidates = await payload.find({
          collection: 'feastTemplates',
          where: {
            tenant: { equals: tenantId },
          },
          limit: 1000,
        })

        for (const doc of candidates.docs) {
          if (thisId && doc.id === thisId) continue

          const otherIsGeneric = Boolean((doc as any).isGeneric)

          // Check if both templates have services for any overlapping days
          let hasOverlappingDay = false
          for (let i = 0; i < DAY_TAB_NAMES.length; i++) {
            const dayTab = DAY_TAB_NAMES[i]
            if (hasServicesForDay(data, dayTab) && hasServicesForDay(doc, dayTab)) {
              hasOverlappingDay = true
              break
            }
          }

          if (!isGeneric && !hasOverlappingDay) continue

          // Generic rule: only one generic template allowed
          if (isGeneric && otherIsGeneric) {
            throw new Error('Only one generic template (without period) is allowed for a tenant')
          }

          // Period overlap rule: period-based templates cannot overlap
          if (!isGeneric && !otherIsGeneric) {
            const overlap = rangesOverlap(
              data.periodStart as string | undefined,
              data.periodEnd as string | undefined,
              doc.periodStart as string | undefined,
              doc.periodEnd as string | undefined
            )
            if (overlap) {
              throw new Error('Period-based templates cannot overlap when they have services for the same days')
            }
          }
        }

        return data
      },
    ],
  },
}

export default TenantWeeklyFeastTemplates



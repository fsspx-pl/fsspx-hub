import { Field } from 'payload'
import { deepMerge } from 'payload/shared'

export const appearanceOptions = {
  primary: {
    label: {
      en: 'Primary Button',
      pl: 'Przycisk główny',
    },
    value: 'primary',
  },
  secondary: {
    label: {
      en: 'Secondary Button',
      pl: 'Przycisk drugorzędny',
    },
    value: 'secondary',
  },
  default: {
    label: {
      en: 'Default',
      pl: 'Domyślny',
    },
    value: 'default',
  },
}

export type LinkAppearances = 'primary' | 'secondary' | 'default'

type LinkType = (options?: {
  appearances?: LinkAppearances[] | false
  disableLabel?: boolean
  overrides?: Record<string, unknown>
}) => Field

const link: LinkType = ({ appearances, disableLabel = false, overrides = {} } = {}) => {
  const linkResult: Field = {
    name: 'link',
    type: 'group',
    admin: {
      hideGutter: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            label: {
              en: 'Type',
              pl: 'Rodzaj',
            },
            type: 'radio',
            options: [
              {
                label: {
                  en: 'Internal link',
                  pl: 'Link wewnętrzny',
                },
                value: 'reference',
              },
              {
                label: {
                  en: 'Custom URL',
                  pl: 'Własny URL',
                },
                value: 'custom',
              },
            ],
            defaultValue: 'reference',
            admin: {
              layout: 'horizontal',
              width: '50%',
            },
          },
          {
            name: 'newTab',
            label: {
              en: 'Open in new tab',
              pl: 'Otwórz w nowej karcie',
            },
            type: 'checkbox',
            admin: {
              width: '50%',
              style: {
                alignSelf: 'flex-end',
              },
            },
          },
        ],
      },
    ],
  }

  const linkTypes: Field[] = [
    {
      name: 'reference',
      label: {
        en: 'Document to link to',
        pl: 'Dokument do linku',
      },
      type: 'relationship',
      relationTo: ['pages'],
      required: true,
      maxDepth: 1,
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
    },
    {
      name: 'url',
      label: {
        en: 'Custom URL',
        pl: 'Własny URL',
      },
      type: 'text',
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
    },
  ]

  if (!disableLabel) {
    const linkTypesToUpdate: Field[] = linkTypes.map(link => link && link.admin ? ({
      ...link,
      label: {
        en: 'Label',
        pl: 'Etykieta',
      },
      admin: {
        ...link.admin,
        width: '50%'
      }
    } as Field) : link)

    linkResult.fields.push({
      type: 'row',
      fields: [
        ...linkTypesToUpdate,
        {
          name: 'label',
          label: {
            en: 'Label',
            pl: 'Etykieta',
          },
          type: 'text',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    })
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes]
  }

  if (appearances !== false) {
    let appearanceOptionsToUse = [
      appearanceOptions.default,
      appearanceOptions.primary,
      appearanceOptions.secondary,
    ]

    if (appearances) {
      appearanceOptionsToUse = appearances.map(appearance => appearanceOptions[appearance])
    }

    linkResult.fields.push({
      name: 'appearance',
      label: {
        en: 'Appearance',
        pl: 'Wygląd',
      },
      type: 'select',
      defaultValue: 'default',
      options: appearanceOptionsToUse,
      admin: {
        description: {
          en: 'Choose how the link should be rendered.',
          pl: 'Wybierz, jak link ma być renderowany.',
        },
      },
    })
  }

  return deepMerge(linkResult, overrides) as Field
}

export default link

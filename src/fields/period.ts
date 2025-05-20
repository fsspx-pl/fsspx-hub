import { Field } from "payload"

export const period: Field = {
  name: 'period',
  label: {
    pl: 'Dla okresu',
    en: 'For Period'
  },
  type: 'group',
  admin: {
    position: 'sidebar',
    condition: (_, siblingData) => siblingData.type === 'pastoral-announcements',
  },
  fields: [
    {
      name: 'start',
      type: 'date',
      required: true,
      admin: {
        width: '50%',
      },
    },
    {
      name: 'end',
      type: 'date',
      required: true,
      admin: {
        width: '50%',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ value }) => {
        if(value?.start) {
          return value
        }
        return ({
          ...value,
          start: new Date(),
        })
      },
      ({ value }) => {
        if (value?.start > value?.end) {
          throw new Error('Start date must be before end date')
        }
        return value
      }
    ]
  }
}

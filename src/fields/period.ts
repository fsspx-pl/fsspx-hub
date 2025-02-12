import { Field } from "payload"

export const period: Field = {
  name: 'period',
  label: {
    pl: 'Dla okresu',
    en: 'For Period'
  },
  type: 'group',
  fields: [
    {
      name: 'start',
      type: 'date',
    },
    {
      name: 'end',
      type: 'date',
      required: true,
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


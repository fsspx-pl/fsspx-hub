import { Field } from "payload"

export const location: Field[] = [
  {
    name: 'city',
    type: 'text',
    required: true,
  },
  {
    name: 'type',
    type: 'select',
    label: {
      pl: 'Typ',
    },
    localized: true,
    options: [
      // here it should be 'chapel' and 'mission',
      // but there is no localization of values in Payload
      { label: { pl: 'Kaplica' }, value: 'Kaplica' },
      { label: { pl: 'Misja' }, value: 'Misja' },
    ],
    required: true,
    defaultValue: 'Kaplica',
  },
  {
    name: 'patron',
    type: 'text',
  },
  {
    name: 'coverBackground',
    type: 'upload',
    relationTo: 'media',
    required: true,
  },
  {
    name: 'address',
    label: {
      pl: 'Adres',
    },
    type: 'group',
    fields: [
      {
        name: 'street',
        label: {
          pl: 'Ulica',
        },
        type: 'text',
        required: true,
      },
      {
        name: 'zipcode',
        label: {
          pl: 'Kod pocztowy',
        },
        type: 'text',
        validate: (value: string) => {
          const regex = /^\d{2}-\d{3}$/
          if (!regex.test(value)) {
            return 'Field must match the pattern XX-XXX'
          }
          return true
        },
        required: true,
      },
      {
        name: 'email',
        type: 'email',
      },
      {
        name: 'phone',
        type: 'text',
        label: {
          pl: 'Numer telefonu',
        },
        validate: value => {
          if(!value) return true
          if (value?.length !== 9 || !/^\d{9}$/.test(value)) {
            return 'Mobile number must be exactly 9 digits in the format XXX-XXX-XXX'
          }
          return true
        },
      },
    ],
  },
]
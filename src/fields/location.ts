import { Field } from "payload"

export const location: Field[] = [
  {
    name: 'city',
    label: {
      en: 'City',
      pl: 'Miasto',
    },
    type: 'text',
    required: true,
    admin: {
      width: '50%',
    },
  },
  {
    name: 'type',
    type: 'select',
    label: {
      en: 'Type',
      pl: 'Rodzaj',
    },
    localized: true,
    options: [
      // here it should be 'chapel' and 'mission',
      // but there is no localization of values in Payload
      { label: { en: 'Chapel', pl: 'Kaplica' }, value: 'Kaplica' },
      { label: { en: 'Mission', pl: 'Misja' }, value: 'Misja' },
    ],
    required: true,
    defaultValue: 'Kaplica',
  },
  {
    name: 'patron',
    label: {
      en: 'Patron',
      pl: 'Patron',
    },
    type: 'text',
  },
  {
    name: 'coverBackground',
    label: {
      en: 'Cover Background',
      pl: 'Obraz tła',
    },
    type: 'upload',
    relationTo: 'media',
    required: true,
  },
  {
    name: 'address',
    label: {
      en: 'Address',
      pl: 'Adres',
    },
    type: 'group',
    fields: [
      {
        name: 'street',
        label: {
          en: 'Street',
          pl: 'Ulica',
        },
        type: 'text',
        required: true,
      },
      {
        name: 'zipcode',
        label: {
          en: 'Zip Code',
          pl: 'Kod pocztowy',
        },
        type: 'text',
        validate: (value: string | null | undefined) => {
          if (!value) return true
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
        label: {
          en: 'Email',
          pl: 'Email',
        },
        type: 'email',
      },
      {
        name: 'phone',
        type: 'text',
        label: {
          en: 'Phone Number',
          pl: 'Numer telefonu',
        },
        validate: (value: string | null | undefined) => {
          if(!value) return true
          if (value.length !== 9 || !/^\d{9}$/.test(value)) {
            return 'Mobile number must be exactly 9 digits in the format XXX-XXX-XXX'
          }
          return true
        },
      },
    ],
  },
]
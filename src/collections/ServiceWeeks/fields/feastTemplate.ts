import { Field } from "payload";

export const getFeastTemplate: (defaultValue: 'sunday' | 'otherDays') => Field = defaultValue => ({
    name: 'template',
    type: 'radio',
    options: [
      {
        label: {
          pl: 'Dni powszednie',
          en: 'Other days'
        },
        value: 'otherDays'
      },
      {
        label: {
          pl: 'Niedziela',
          en: 'Sunday'
        },
        value: 'sunday'
      },
    ],
    defaultValue,
    admin: {
      layout: 'horizontal',
      description: {
        pl: 'Wybierz szablon do zastosowania',
        en: 'Choose Feast Template to apply'
      }
    }
  })
import { format, parseISO } from "date-fns";
import { Field } from "payload";

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
      label: {
        en: 'Start Date',
        pl: 'Data Początkowa',
      },
      type: 'date',
      required: true,
      admin: {
        width: '50%',
      },
    },
    {
      name: 'end',
      label: {
        en: 'End Date',
        pl: 'Data Końcowa',
      },
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

export const startLocal: Field = {
  name: 'startLocal',
  type: 'text',
  label: {
    pl: 'Data początkowa',
    en: 'Start date'
  },
  admin: {
    hidden: true,
    readOnly: true,
  },
  hooks: {
    afterRead: [
      ({ data }) => {
        const start = data?.period?.start;
        if (!start) return null;
        return format(parseISO(start), 'dd.MM.yyyy');
      }
    ]
  }
}

export const endLocal: Field = {
  name: 'endLocal',
  type: 'text',
  label: {
    pl: 'Data końcowa',
    en: 'End date'
  },
  admin: {
    hidden: true,
    readOnly: true,
  },
  hooks: {
    afterRead: [
      ({ data }) => {
        const end = data?.period?.end;
        if (!end) return null;
        return format(parseISO(end), 'dd.MM.yyyy');
      }
    ]
  }
}
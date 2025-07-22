import { setHours } from 'date-fns';
import { Field } from 'payload';

const now = new Date();

const time: Field = {
  name: 'time',
  label: {
    pl: 'Godzina nabożeństwa',
    en: 'Service time'
  },
  type: 'date',
  admin: {
    date: {
      minTime: setHours(now, 6),
      maxTime: setHours(now, 20),
      pickerAppearance: 'timeOnly',
      displayFormat: 'HH:mm',
      timeIntervals: 60,
      timeFormat: 'HH:mm',
    },
  },
  required: true,
};

const category: Field = {
  name: 'category',
  label: {
    en: 'Category',
    pl: 'Kategoria',
  },
  type: 'select',
  required: true,
  options: [
    { 
      label: {
        pl: 'Msza Święta',
        en: 'Holy Mass',
      }, 
      value: 'mass' 
    },
    { 
      label: {
        pl: 'Różaniec',
        en: 'Rosary',
      }, 
      value: 'rosary' 
    },
    { 
      label: {
        pl: 'Gorzkie Żale',
        en: 'Lamentations',
      }, 
      value: 'lamentations' 
    },
    { 
      label: {
        pl: 'Inne',
        en: 'Other',
      }, 
      value: 'other' 
    },
  ],
};

const massType: Field = {
  name: 'massType',
  label: {
    en: 'Mass Type',
    pl: 'Rodzaj Mszy Świętej',
  },
  type: 'select',
  required: true,
  options: [
    { 
      label: {
        pl: 'Śpiewana',
        en: 'Sung',
      }, 
      value: 'sung' 
    },
    { 
      label: {
        pl: 'Czytana',
        en: 'Read',
      }, 
      value: 'read' 
    },
    { 
      label: {
        pl: 'Cicha',
        en: 'Silent',
      }, 
      value: 'silent' 
    },
    { 
      label: {
        pl: 'Solenna',
        en: 'Solemn',
      }, 
      value: 'solemn' 
    },
  ],
  admin: {
    condition: (_, siblingData) => siblingData?.category === 'mass',
    description: {
      pl: 'Rodzaj Mszy Świętej, który będzie widoczny w kalendarzu oraz w newsletterze',
      en: 'Holy Mass type, visible in the calendar and newsletter'
    }
  },
};

const customTitle: Field = {
  name: 'customTitle',
  type: 'text',
  required: true,
  label: {
    pl: 'Nazwa nabożeństwa',
    en: 'Service title'
  },
  admin: {
    condition: (_, siblingData) => siblingData?.category === 'other',
    description: {
      pl: 'Nazwa nabożeństwa, która będzie widoczna w kalendarzu oraz w newsletterze',
      en: 'Service title, visible in the calendar and newsletter'
    }
  },
};

const notes: Field = {
  name: 'notes',
  type: 'text',
  label: {
    pl: 'Dodatkowe informacje',
    en: 'Notes'
  },
  admin: {
    description: {
      pl: 'Dodatkowe informacje o nabożeństwie, które będą widoczne w kalendarzu poniej tytułu nabożeństwa oraz w newsletterze',
      en: 'Additional information about the service, visible below the service title in the calendar and newsletter'
    }
  }
};

const serviceFields = {
  time,
  category,
  massType,
  customTitle,
  notes,
};


export default serviceFields;
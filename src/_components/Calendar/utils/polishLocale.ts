import { pl } from 'date-fns/locale';

export const polishLocale = {
  ...pl,
  localize: {
    ...pl.localize,
    day: (n: number) => {
      const days = ['ndz', 'pon', 'wt', 'śr', 'czw', 'pt', 'sob'];
      return days[n];
    }
  }
}; 
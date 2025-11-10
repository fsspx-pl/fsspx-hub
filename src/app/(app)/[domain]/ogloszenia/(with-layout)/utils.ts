import { fetchTenants } from '@/_api/fetchTenants';
import { addMonths, getMonth, getYear } from 'date-fns';

export const getCurrentMonth = () => {
  const now = new Date();
  return {
    year: getYear(now),
    month: getMonth(now) + 1, // getMonth returns 0-11, we need 1-12
  };
};

export const getMonthFromParams = (searchParams: URLSearchParams | null | undefined | any) => {
  if (!searchParams) {
    return getCurrentMonth();
  }
  
  let yearParam, monthParam;
  
  if (typeof searchParams.get === 'function') {
    yearParam = searchParams.get('year');
    monthParam = searchParams.get('month');
  } else if (typeof searchParams === 'object') {
    yearParam = searchParams.year;
    monthParam = searchParams.month;
  } else {
    return getCurrentMonth();
  }
  
  // Only use URL params if both year and month are valid numbers
  if (yearParam && monthParam) {
    const year = parseInt(yearParam, 10);
    const month = parseInt(monthParam, 10);
    
    // Validate that the values are reasonable
    if (!isNaN(year) && !isNaN(month) && year >= 2020 && year <= 2030 && month >= 1 && month <= 12) {
      return { year, month };
    }
  }
  
  return getCurrentMonth();
};

export const generateMonthParams = async () => {
  const tenants = await fetchTenants();
  const params = [];
  
  const currentDate = new Date();
  const monthsToGenerate = 6; // ±6 months
  
  for (const tenant of tenants.filter((tenant) => tenant.general.domain)) {
    for (let i = -monthsToGenerate; i <= monthsToGenerate; i++) {
      const targetDate = i === 0 ? currentDate : addMonths(currentDate, i);
      const year = getYear(targetDate);
      const month = getMonth(targetDate) + 1;
      
      params.push({
        domain: tenant.general.domain,
        year: year.toString(),
        month: month.toString(),
      });
    }
  }
  
  return params;
}; 
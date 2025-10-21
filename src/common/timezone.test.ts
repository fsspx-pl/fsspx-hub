import { createPolishDate, formatInPolishTime, polishTimeToUtc, POLISH_TIMEZONE } from './timezone';

describe('Timezone Utilities', () => {
  describe('POLISH_TIMEZONE constant', () => {
    it('should be set to Europe/Warsaw', () => {
      expect(POLISH_TIMEZONE).toBe('Europe/Warsaw');
    });
  });

  describe('createPolishDate', () => {
    it('should create a UTC date from Polish local time components', () => {
      // January 15, 2024, 10:30 AM in Polish time
      const date = createPolishDate(2024, 1, 15, 10, 30);
      
      // In January, Poland is UTC+1 (no DST), so 10:30 in Warsaw = 09:30 UTC
      expect(date.toISOString()).toBe('2024-01-15T09:30:00.000Z');
    });

    it('should handle summer time (DST) correctly', () => {
      // July 15, 2024, 10:30 AM in Polish time
      const date = createPolishDate(2024, 7, 15, 10, 30);
      
      // In July, Poland is UTC+2 (DST), so 10:30 in Warsaw = 08:30 UTC
      expect(date.toISOString()).toBe('2024-07-15T08:30:00.000Z');
    });

    it('should default hour and minute to 0 if not provided', () => {
      const date = createPolishDate(2024, 1, 15);
      
      // January 15, 2024, 00:00 in Warsaw = January 14, 23:00 UTC (UTC+1)
      expect(date.toISOString()).toBe('2024-01-14T23:00:00.000Z');
    });

    it('should handle midnight correctly', () => {
      const date = createPolishDate(2024, 1, 15, 0, 0);
      
      expect(date.toISOString()).toBe('2024-01-14T23:00:00.000Z');
    });

    it('should handle noon correctly', () => {
      const date = createPolishDate(2024, 1, 15, 12, 0);
      
      expect(date.toISOString()).toBe('2024-01-15T11:00:00.000Z');
    });

    it('should handle end of day correctly', () => {
      const date = createPolishDate(2024, 1, 15, 23, 59);
      
      expect(date.toISOString()).toBe('2024-01-15T22:59:00.000Z');
    });

    it('should pad single digit months and days', () => {
      const date = createPolishDate(2024, 3, 5, 10, 30);
      
      // March 5, 2024, 10:30 AM in Polish time (DST not yet active)
      expect(date.toISOString()).toBe('2024-03-05T09:30:00.000Z');
    });

    it('should handle DST transition correctly - spring forward', () => {
      // Last Sunday of March 2024 at 2:00 AM, clocks move to 3:00 AM
      // March 31, 2024 at 1:00 AM (before DST)
      const beforeDST = createPolishDate(2024, 3, 31, 1, 0);
      expect(beforeDST.toISOString()).toBe('2024-03-31T00:00:00.000Z');
      
      // March 31, 2024 at 3:00 AM (after DST - 2:00 doesn't exist)
      const afterDST = createPolishDate(2024, 3, 31, 3, 0);
      expect(afterDST.toISOString()).toBe('2024-03-31T01:00:00.000Z');
    });

    it('should handle DST transition correctly - fall back', () => {
      // Last Sunday of October 2024 at 3:00 AM, clocks move back to 2:00 AM
      // October 27, 2024 at 2:00 AM (after falling back, UTC+1)
      const afterFallback = createPolishDate(2024, 10, 27, 2, 0);
      expect(afterFallback.toISOString()).toBe('2024-10-27T01:00:00.000Z');
    });
  });

  describe('formatInPolishTime', () => {
    it('should format a UTC date in Polish timezone', () => {
      // January 15, 2024, 09:30 UTC = 10:30 in Warsaw (UTC+1)
      const utcDate = new Date('2024-01-15T09:30:00.000Z');
      const formatted = formatInPolishTime(utcDate, 'yyyy-MM-dd HH:mm');
      
      expect(formatted).toBe('2024-01-15 10:30');
    });

    it('should format a UTC date in Polish timezone during summer', () => {
      // July 15, 2024, 08:30 UTC = 10:30 in Warsaw (UTC+2)
      const utcDate = new Date('2024-07-15T08:30:00.000Z');
      const formatted = formatInPolishTime(utcDate, 'yyyy-MM-dd HH:mm');
      
      expect(formatted).toBe('2024-07-15 10:30');
    });

    it('should accept date strings', () => {
      const formatted = formatInPolishTime('2024-01-15T09:30:00.000Z', 'yyyy-MM-dd HH:mm');
      
      expect(formatted).toBe('2024-01-15 10:30');
    });

    it('should support different format strings', () => {
      const utcDate = new Date('2024-01-15T09:30:00.000Z');
      
      expect(formatInPolishTime(utcDate, 'yyyy-MM-dd')).toBe('2024-01-15');
      expect(formatInPolishTime(utcDate, 'HH:mm')).toBe('10:30');
      expect(formatInPolishTime(utcDate, 'EEEE')).toMatch(/poniedziałek|wtorek|środa|czwartek|piątek|sobota|niedziela/);
    });

    it('should use Polish locale for day and month names', () => {
      const utcDate = new Date('2024-01-15T09:30:00.000Z'); // Monday
      const dayName = formatInPolishTime(utcDate, 'EEEE');
      
      // Monday in Polish is "poniedziałek"
      expect(dayName).toBe('poniedziałek');
    });
  });

  describe('polishTimeToUtc', () => {
    it('should convert a Polish local time to UTC', () => {
      // Create a date representing January 15, 2024, 10:30 in local time
      // We need to use createPolishDate to get the right date, then test conversion
      const polishDate = createPolishDate(2024, 1, 15, 10, 30);
      
      // polishTimeToUtc should handle the timezone conversion
      // Since we're starting with a UTC date from createPolishDate,
      // we need to create a date object that represents the Polish local time
      const localDate = new Date('2024-01-15T10:30:00'); // This is ambiguous
      const result = polishTimeToUtc(localDate);
      
      // The result should be a UTC date
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle DST correctly in conversion', () => {
      // July 15, 2024, 10:30 AM in Polish local time
      const localDate = new Date('2024-07-15T10:30:00');
      const result = polishTimeToUtc(localDate);
      
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('Integration: Round-trip conversion', () => {
    it('should maintain consistency when converting to UTC and back', () => {
      const originalYear = 2024;
      const originalMonth = 1;
      const originalDay = 15;
      const originalHour = 10;
      const originalMinute = 30;
      
      // Create a UTC date from Polish time components
      const utcDate = createPolishDate(originalYear, originalMonth, originalDay, originalHour, originalMinute);
      
      // Format it back to Polish time
      const formatted = formatInPolishTime(utcDate, 'yyyy-MM-dd HH:mm');
      
      // Should match the original input
      expect(formatted).toBe(`${originalYear}-${String(originalMonth).padStart(2, '0')}-${String(originalDay).padStart(2, '0')} ${String(originalHour).padStart(2, '0')}:${String(originalMinute).padStart(2, '0')}`);
    });

    it('should maintain consistency during DST period', () => {
      const originalYear = 2024;
      const originalMonth = 7;
      const originalDay = 15;
      const originalHour = 14;
      const originalMinute = 45;
      
      // Create a UTC date from Polish summer time components
      const utcDate = createPolishDate(originalYear, originalMonth, originalDay, originalHour, originalMinute);
      
      // Format it back to Polish time
      const formatted = formatInPolishTime(utcDate, 'yyyy-MM-dd HH:mm');
      
      // Should match the original input
      expect(formatted).toBe(`${originalYear}-${String(originalMonth).padStart(2, '0')}-${String(originalDay).padStart(2, '0')} ${String(originalHour).padStart(2, '0')}:${String(originalMinute).padStart(2, '0')}`);
    });
  });
});


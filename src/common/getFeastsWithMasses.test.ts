import { formatInTimeZone } from 'date-fns-tz';

const POLISH_TIMEZONE = 'Europe/Warsaw';

/**
 * Extracts the date portion (yyyy-MM-dd) in Polish timezone.
 * This is the same function used in getFeastsWithMasses.tsx
 */
const toPolishDateString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(dateObj, POLISH_TIMEZONE, 'yyyy-MM-dd');
};

describe('toPolishDateString', () => {
  describe('midnight handling (issue #112)', () => {
    it('should place midnight (00:00) at the beginning of the day, not end of previous day', () => {
      // A service at midnight (00:00) on Jan 15th in Polish time
      // is stored as 2024-01-14T23:00:00.000Z in UTC (winter time, UTC+1)
      const midnightServiceUtc = '2024-01-14T23:00:00.000Z';
      
      const polishDateString = toPolishDateString(midnightServiceUtc);
      
      // Should be Jan 15, not Jan 14
      expect(polishDateString).toBe('2024-01-15');
    });

    it('should correctly identify midnight service date in summer time (DST)', () => {
      // A service at midnight (00:00) on July 15th in Polish time
      // is stored as 2024-07-14T22:00:00.000Z in UTC (summer time, UTC+2)
      const midnightServiceUtc = '2024-07-14T22:00:00.000Z';
      
      const polishDateString = toPolishDateString(midnightServiceUtc);
      
      // Should be July 15, not July 14
      expect(polishDateString).toBe('2024-07-15');
    });

    it('should correctly identify 23:59 as still the same day', () => {
      // A service at 23:59 on Jan 15th in Polish time
      // is stored as 2024-01-15T22:59:00.000Z in UTC
      const lateNightServiceUtc = '2024-01-15T22:59:00.000Z';
      
      const polishDateString = toPolishDateString(lateNightServiceUtc);
      
      expect(polishDateString).toBe('2024-01-15');
    });

    it('should correctly identify 00:01 as the start of the new day', () => {
      // A service at 00:01 on Jan 15th in Polish time
      // is stored as 2024-01-14T23:01:00.000Z in UTC
      const justAfterMidnightUtc = '2024-01-14T23:01:00.000Z';
      
      const polishDateString = toPolishDateString(justAfterMidnightUtc);
      
      expect(polishDateString).toBe('2024-01-15');
    });
  });

  describe('regular time handling', () => {
    it('should correctly identify a morning service date', () => {
      // A service at 08:00 on Jan 15th in Polish time
      // is stored as 2024-01-15T07:00:00.000Z in UTC
      const morningServiceUtc = '2024-01-15T07:00:00.000Z';
      
      const polishDateString = toPolishDateString(morningServiceUtc);
      
      expect(polishDateString).toBe('2024-01-15');
    });

    it('should correctly identify an afternoon service date', () => {
      // A service at 15:00 on Jan 15th in Polish time
      // is stored as 2024-01-15T14:00:00.000Z in UTC
      const afternoonServiceUtc = '2024-01-15T14:00:00.000Z';
      
      const polishDateString = toPolishDateString(afternoonServiceUtc);
      
      expect(polishDateString).toBe('2024-01-15');
    });
  });

  describe('DST transition handling', () => {
    it('should handle spring DST transition correctly', () => {
      // March 31, 2024 at 3:00 AM in Polish time (just after DST starts)
      // is stored as 2024-03-31T01:00:00.000Z in UTC
      const afterSpringDst = '2024-03-31T01:00:00.000Z';
      
      const polishDateString = toPolishDateString(afterSpringDst);
      
      expect(polishDateString).toBe('2024-03-31');
    });

    it('should handle fall DST transition correctly', () => {
      // October 27, 2024 at 2:00 AM in Polish time (after DST ends)
      // is stored as 2024-10-27T01:00:00.000Z in UTC
      const afterFallDst = '2024-10-27T01:00:00.000Z';
      
      const polishDateString = toPolishDateString(afterFallDst);
      
      expect(polishDateString).toBe('2024-10-27');
    });
  });

  describe('feast and mass matching', () => {
    it('should match a midnight service with the correct feast day', () => {
      // Feast for Jan 15th (created from liturgical calendar as midnight UTC)
      const feastDate = new Date('2024-01-15T00:00:00.000Z');
      
      // Service at midnight on Jan 15th in Polish time (stored as UTC)
      const midnightServiceUtc = '2024-01-14T23:00:00.000Z';
      
      const feastDateString = toPolishDateString(feastDate);
      const serviceDateString = toPolishDateString(midnightServiceUtc);
      
      // Both should be Jan 15
      expect(feastDateString).toBe('2024-01-15');
      expect(serviceDateString).toBe('2024-01-15');
      expect(feastDateString).toBe(serviceDateString);
    });

    it('should NOT match a midnight service with the previous day feast', () => {
      // Feast for Jan 14th
      const feastDate = new Date('2024-01-14T00:00:00.000Z');
      
      // Service at midnight on Jan 15th in Polish time
      const midnightServiceUtc = '2024-01-14T23:00:00.000Z';
      
      const feastDateString = toPolishDateString(feastDate);
      const serviceDateString = toPolishDateString(midnightServiceUtc);
      
      // Feast is Jan 14, service is Jan 15 - should NOT match
      expect(feastDateString).toBe('2024-01-14');
      expect(serviceDateString).toBe('2024-01-15');
      expect(feastDateString).not.toBe(serviceDateString);
    });
  });
});

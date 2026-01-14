import { addPeriodStartDate } from './addPeriodStartDate';
import { Announcement } from '@/payload-types';
import { FieldHookArgs } from 'payload';

describe('addPeriodStartDate', () => {
  const mockDataWithPeriod: Partial<Announcement> = {
    period: {
      start: '2024-03-15T00:00:00.000Z',
      end: '2024-03-21T00:00:00.000Z',
    },
  };

  // Helper to create mock hook args with type assertion
  const createMockArgs = (args: Partial<FieldHookArgs<Announcement>>): FieldHookArgs<Announcement> => {
    return args as FieldHookArgs<Announcement>;
  };

  it('should return value unchanged for non-create operations', () => {
    const result = addPeriodStartDate(createMockArgs({
      operation: 'update',
      value: 'test-slug',
      data: mockDataWithPeriod,
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    expect(result).toBe('test-slug');
  });

  it('should return value unchanged when period.start is missing', () => {
    const result = addPeriodStartDate(createMockArgs({
      operation: 'create',
      value: 'test-slug',
      data: {},
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    expect(result).toBe('test-slug');
  });

  it('should return value unchanged when value is not a string', () => {
    const result = addPeriodStartDate(createMockArgs({
      operation: 'create',
      value: 123,
      data: mockDataWithPeriod,
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    expect(result).toBe(123);
  });

  it('should append date when page ID is not available', () => {
    const result = addPeriodStartDate(createMockArgs({
      operation: 'create',
      value: 'test-slug',
      data: mockDataWithPeriod,
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    expect(result).toBe('test-slug-15-03-2024');
  });

  it('should append date and guid when page ID is available', () => {
    const dataWithId = {
      ...mockDataWithPeriod,
      id: 'page-12345678-abcdef',
    };

    const result = addPeriodStartDate(createMockArgs({
      operation: 'create',
      value: 'test-slug',
      data: dataWithId,
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    expect(result).toBe('test-slug-15-03-2024-page-123');
  });

  it('should prevent duplicate dates when already appended', () => {
    const dataWithId = {
      ...mockDataWithPeriod,
      id: 'page-12345678-abcdef',
    };

    const valueWithDate = 'test-slug-15-03-2024-page-123';

    const result = addPeriodStartDate(createMockArgs({
      operation: 'create',
      value: valueWithDate,
      data: dataWithId,
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    expect(result).toBe(valueWithDate);
  });

  it('should remove existing date patterns before appending', () => {
    const dataWithId = {
      ...mockDataWithPeriod,
      id: 'page-12345678-abcdef',
    };

    const valueWithOldDate = 'test-slug-10-01-2024-oldguid';

    const result = addPeriodStartDate(createMockArgs({
      operation: 'create',
      value: valueWithOldDate,
      data: dataWithId,
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    expect(result).toBe('test-slug-15-03-2024-page-123');
  });

  it('should remove existing date pattern without guid before appending', () => {
    const dataWithId = {
      ...mockDataWithPeriod,
      id: 'page-12345678-abcdef',
    };

    const valueWithOldDate = 'test-slug-10-01-2024';

    const result = addPeriodStartDate(createMockArgs({
      operation: 'create',
      value: valueWithOldDate,
      data: dataWithId,
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    expect(result).toBe('test-slug-15-03-2024-page-123');
  });

  it('should handle multiple date patterns in slug', () => {
    const dataWithId = {
      ...mockDataWithPeriod,
      id: 'page-12345678-abcdef',
    };

    // Simulate a slug with multiple dates (the problematic case)
    const valueWithMultipleDates = 'owsze-ogloszenia-03-08-2025-03-08-2025-03-08-2025';

    const result = addPeriodStartDate(createMockArgs({
      operation: 'create',
      value: valueWithMultipleDates,
      data: dataWithId,
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    // Should remove all trailing date patterns and add the correct one
    expect(result).toBe('owsze-ogloszenia-15-03-2024-page-123');
  });

  it('should handle empty page ID gracefully', () => {
    const dataWithEmptyId = {
      ...mockDataWithPeriod,
      id: '',
    };

    const result = addPeriodStartDate(createMockArgs({
      operation: 'create',
      value: 'test-slug',
      data: dataWithEmptyId,
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    expect(result).toBe('test-slug-15-03-2024');
  });

  it('should handle page ID shorter than 8 characters', () => {
    const dataWithShortId = {
      ...mockDataWithPeriod,
      id: 'abc',
    };

    const result = addPeriodStartDate(createMockArgs({
      operation: 'create',
      value: 'test-slug',
      data: dataWithShortId,
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    expect(result).toBe('test-slug-15-03-2024-abc');
  });

  it('should format date correctly for different dates', () => {
    const dataWithDifferentDate = {
      period: {
        start: '2024-12-25T00:00:00.000Z',
        end: '2024-12-31T00:00:00.000Z',
      },
      id: 'page-12345678-abcdef',
    };

    const result = addPeriodStartDate(createMockArgs({
      operation: 'create',
      value: 'test-slug',
      data: dataWithDifferentDate,
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    expect(result).toBe('test-slug-25-12-2024-page-123');
  });

  it('should handle slug with no existing date pattern', () => {
    const dataWithId = {
      ...mockDataWithPeriod,
      id: 'page-12345678-abcdef',
    };

    const result = addPeriodStartDate(createMockArgs({
      operation: 'create',
      value: 'owsze-ogloszenia',
      data: dataWithId,
      originalDoc: {} as Announcement,
      field: {} as any,
      req: {} as any,
      siblingData: {},
    }));

    expect(result).toBe('owsze-ogloszenia-15-03-2024-page-123');
  });
});


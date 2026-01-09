import { organizeMediaFolders } from './organizeMediaFolders';
import { Page, Tenant } from '@/payload-types';

// Mock dependencies
jest.mock('./extractMediaFromLexical', () => ({
  extractMediaFromLexical: jest.fn(),
}));

const { extractMediaFromLexical } = require('./extractMediaFromLexical');

describe('organizeMediaFolders', () => {
  const mockReq = {
    payload: {
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
      findByID: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockTenant: Tenant = {
    id: 'tenant-123',
    name: 'Poznań',
    domain: 'poznan.fsspx.pl',
    city: 'Poznań',
    type: 'Kaplica',
    coverBackground: 'cover-id',
    address: {
      street: 'Test St',
      zipcode: '12345',
    },
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  const mockPage: Page = {
    id: 'page-12345678-abcdef',
    type: 'pastoral-announcements',
    title: 'Test Page Title',
    slug: 'test-page-15-03-2024-page-12', // Slug with date and guid (as processed by addPeriodStartDate hook)
    tenant: mockTenant,
    period: {
      start: '2024-03-15T00:00:00.000Z',
      end: '2024-03-21T00:00:00.000Z',
    },
    content: {
      root: {
        type: 'root',
        children: [],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    attachmentDisplay: {
      displayMode: 'inline',
    },
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    _status: 'published',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock find to return empty (folders don't exist yet)
    (mockReq.payload.find as jest.Mock).mockResolvedValue({ docs: [] });
    // Mock create to return folder with ID based on name
    (mockReq.payload.create as jest.Mock).mockImplementation(({ collection, data }) => ({
      id: `folder-${data.name}-${data.folder || 'root'}`,
      ...data,
    }));
  });

  it('should return early for non-create/update operations', async () => {
    await organizeMediaFolders({
      doc: mockPage,
      req: mockReq as any,
      operation: 'delete' as any,
      previousDoc: mockPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    expect(extractMediaFromLexical).not.toHaveBeenCalled();
  });

  it('should return early when page is not published', async () => {
    await organizeMediaFolders({
      doc: { ...mockPage, _status: 'draft' },
      req: mockReq as any,
      operation: 'create',
      previousDoc: mockPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    expect(extractMediaFromLexical).not.toHaveBeenCalled();
  });

  it('should return early when page has no content', async () => {
    extractMediaFromLexical.mockReturnValue([]);

    await organizeMediaFolders({
      doc: { ...mockPage, content: null },
      req: mockReq as any,
      operation: 'create',
      previousDoc: mockPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    expect(extractMediaFromLexical).not.toHaveBeenCalled();
  });

  it('should return early when no media IDs are found', async () => {
    extractMediaFromLexical.mockReturnValue([]);

    await organizeMediaFolders({
      doc: mockPage,
      req: mockReq as any,
      operation: 'create',
      previousDoc: mockPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    expect(extractMediaFromLexical).toHaveBeenCalled();
    expect(mockReq.payload.find).not.toHaveBeenCalled();
  });

  it('should create correct folder structure', async () => {
    extractMediaFromLexical.mockReturnValue(['media-1', 'media-2']);
    (mockReq.payload.findByID as jest.Mock).mockResolvedValue({
      id: 'media-1',
      folder: null,
      prefix: 'media',
    });

    await organizeMediaFolders({
      doc: mockPage,
      req: mockReq as any,
      operation: 'create',
      previousDoc: mockPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    // Should create Pages folder (root level - no redundant "Media" folder)
    // We're already in the Media collection, so no need for a "Media" folder
    expect(mockReq.payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'payload-folders',
        where: expect.objectContaining({
          and: expect.arrayContaining([
            expect.objectContaining({ name: { equals: 'Pages' } }),
            expect.objectContaining({ folder: { equals: null } }),
          ]),
        }),
      })
    );

    // Should create tenant folder (poznan from domain, under Pages)
    expect(mockReq.payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'payload-folders',
        where: expect.objectContaining({
          and: expect.arrayContaining([
            expect.objectContaining({ name: { equals: 'poznan' } }),
          ]),
        }),
      })
    );

    // Should create page folder using slug (which contains date + guid)
    expect(mockReq.payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'payload-folders',
        where: expect.objectContaining({
          and: expect.arrayContaining([
            expect.objectContaining({ name: { equals: 'test-page-15-03-2024-page-12' } }),
          ]),
        }),
      })
    );
  });

  it('should update media files with correct folder (not prefix)', async () => {
    extractMediaFromLexical.mockReturnValue(['media-1']);
    
    const mockMedia = {
      id: 'media-1',
      folder: null,
      prefix: 'media',
      filename: 'test.pdf',
    };

    (mockReq.payload.findByID as jest.Mock).mockResolvedValue(mockMedia);
    (mockReq.payload.find as jest.Mock).mockResolvedValue({ docs: [] });

    await organizeMediaFolders({
      doc: mockPage,
      req: mockReq as any,
      operation: 'create',
      previousDoc: mockPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    // Should update media with correct folder (for admin UI organization)
    // Should NOT update prefix (to preserve S3 location and previews)
    expect(mockReq.payload.update).toHaveBeenCalledWith({
      collection: 'media',
      id: 'media-1',
      data: {
        folder: expect.stringContaining('test-page-15-03-2024-page-12'),
      },
    });
    
    // Verify prefix was NOT included in the update
    const updateCall = (mockReq.payload.update as jest.Mock).mock.calls.find(
      (call) => call[0].collection === 'media'
    );
    expect(updateCall[0].data.prefix).toBeUndefined();
  });

  it('should handle tenant as string ID', async () => {
    extractMediaFromLexical.mockReturnValue(['media-1']);

    (mockReq.payload.findByID as jest.Mock)
      .mockResolvedValueOnce(mockTenant) // For tenant lookup
      .mockResolvedValueOnce({ id: 'media-1', folder: null, prefix: 'media' }); // For media lookup

    await organizeMediaFolders({
      doc: { ...mockPage, tenant: 'tenant-123' },
      req: mockReq as any,
      operation: 'create',
      previousDoc: mockPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    expect(mockReq.payload.findByID).toHaveBeenCalledWith({
      collection: 'tenants',
      id: 'tenant-123',
    });
  });

  it('should return early when page has no period start date and no slug', async () => {
    extractMediaFromLexical.mockReturnValue(['media-1']);

    const pageWithoutPeriodOrSlug = {
      ...mockPage,
      period: undefined,
      slug: null,
    };

    await organizeMediaFolders({
      doc: pageWithoutPeriodOrSlug,
      req: mockReq as any,
      operation: 'create',
      previousDoc: pageWithoutPeriodOrSlug,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    // Should log error and return early
    expect(mockReq.payload.logger.error).toHaveBeenCalledWith(
      expect.stringContaining('has no period start date and no slug')
    );
    expect(mockReq.payload.find).not.toHaveBeenCalled();
  });

  it('should not update media if folder is already correct', async () => {
    extractMediaFromLexical.mockReturnValue(['media-1']);

    // Mock the folder ID that would be created (no Media folder in path)
    const expectedFolderId = 'folder-test-page-15-03-2024-page-12-folder-poznan-folder-Pages-root';
    
    const mockMedia = {
      id: 'media-1',
      folder: expectedFolderId,
      prefix: 'media', // Original prefix - doesn't matter, we don't check it
    };

    (mockReq.payload.findByID as jest.Mock).mockResolvedValue(mockMedia);
    (mockReq.payload.find as jest.Mock).mockResolvedValue({ docs: [] });

    await organizeMediaFolders({
      doc: mockPage,
      req: mockReq as any,
      operation: 'update',
      previousDoc: mockPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    // Should not update if folder is already correct (prefix is ignored)
    expect(mockReq.payload.update).not.toHaveBeenCalled();
  });

  it('should skip reorganization if slug did not change on update', async () => {
    extractMediaFromLexical.mockReturnValue(['media-1']);

    const previousPage = {
      ...mockPage,
      _status: 'published' as const,
      slug: 'test-page-15-03-2024-page-12',
    };

    const updatedPage = {
      ...mockPage,
      _status: 'published' as const,
      slug: 'test-page-15-03-2024-page-12', // Same slug
      title: 'Updated Title', // Other field changed
    };

    await organizeMediaFolders({
      doc: updatedPage,
      req: mockReq as any,
      operation: 'update',
      previousDoc: previousPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    // Should skip reorganization when slug didn't change
    expect(extractMediaFromLexical).not.toHaveBeenCalled();
    expect(mockReq.payload.find).not.toHaveBeenCalled();
    expect(mockReq.payload.update).not.toHaveBeenCalled();
  });

  it('should reorganize and log warning when slug changes on update', async () => {
    extractMediaFromLexical.mockReturnValue(['media-1']);

    const previousPage = {
      ...mockPage,
      _status: 'published' as const,
      slug: 'old-slug-15-03-2024-page-12',
    };

    const updatedPage = {
      ...mockPage,
      _status: 'published' as const,
      slug: 'new-slug-15-03-2024-page-12', // Slug changed
    };

    (mockReq.payload.findByID as jest.Mock).mockResolvedValue({
      id: 'media-1',
      folder: null,
      prefix: 'media',
    });
    (mockReq.payload.find as jest.Mock).mockResolvedValue({ docs: [] });

    await organizeMediaFolders({
      doc: updatedPage,
      req: mockReq as any,
      operation: 'update',
      previousDoc: previousPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    // Should log warning about slug change
    expect(mockReq.payload.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('slug changed from "old-slug-15-03-2024-page-12" to "new-slug-15-03-2024-page-12"')
    );

    // Should reorganize media files
    expect(extractMediaFromLexical).toHaveBeenCalled();
    expect(mockReq.payload.find).toHaveBeenCalled();
    expect(mockReq.payload.update).toHaveBeenCalled();
  });

  it('should add date to slug when slug changes without date', async () => {
    extractMediaFromLexical.mockReturnValue(['media-1']);

    const previousPage = {
      ...mockPage,
      _status: 'published' as const,
      slug: 'old-slug-15-03-2024-page-12',
    };

    const updatedPage = {
      ...mockPage,
      _status: 'published' as const,
      slug: 'new-slug-without-date', // Slug changed but no date
      period: {
        start: '2024-03-15T00:00:00.000Z',
        end: '2024-03-21T00:00:00.000Z',
      },
    };

    (mockReq.payload.findByID as jest.Mock).mockResolvedValue({
      id: 'media-1',
      folder: null,
      prefix: 'media',
    });
    (mockReq.payload.find as jest.Mock).mockResolvedValue({ docs: [] });

    await organizeMediaFolders({
      doc: updatedPage,
      req: mockReq as any,
      operation: 'update',
      previousDoc: previousPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    // Should update the slug to include date and guid (first 8 chars of page ID)
    expect(mockReq.payload.update).toHaveBeenCalledWith({
      collection: 'pages',
      id: updatedPage.id,
      data: {
        slug: 'new-slug-without-date-15-03-2024-page-123',
      },
    });

    // Should log info about slug update
    expect(mockReq.payload.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('slug updated to include date: "new-slug-without-date-15-03-2024-page-123"')
    );

    // Should reorganize media files with updated slug
    expect(extractMediaFromLexical).toHaveBeenCalled();
    expect(mockReq.payload.find).toHaveBeenCalled();
  });

  it('should not add date if slug already has date pattern', async () => {
    extractMediaFromLexical.mockReturnValue(['media-1']);

    const previousPage = {
      ...mockPage,
      _status: 'published' as const,
      slug: 'old-slug-15-03-2024-page-12',
    };

    const updatedPage = {
      ...mockPage,
      _status: 'published' as const,
      slug: 'new-slug-20-04-2024-page-12', // Slug changed but already has date
    };

    (mockReq.payload.findByID as jest.Mock).mockResolvedValue({
      id: 'media-1',
      folder: null,
      prefix: 'media',
    });
    (mockReq.payload.find as jest.Mock).mockResolvedValue({ docs: [] });

    await organizeMediaFolders({
      doc: updatedPage,
      req: mockReq as any,
      operation: 'update',
      previousDoc: previousPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    // Should NOT update the slug (already has date)
    const pageUpdates = (mockReq.payload.update as jest.Mock).mock.calls.filter(
      (call) => call[0].collection === 'pages'
    );
    expect(pageUpdates.length).toBe(0);

    // Should still reorganize media files
    expect(extractMediaFromLexical).toHaveBeenCalled();
    expect(mockReq.payload.find).toHaveBeenCalled();
  });

  it('should reorganize on update when page transitions from draft to published', async () => {
    extractMediaFromLexical.mockReturnValue(['media-1']);

    const previousPage = {
      ...mockPage,
      _status: 'draft' as const,
      slug: 'test-page-15-03-2024-page-12',
    };

    const publishedPage = {
      ...mockPage,
      _status: 'published' as const,
      slug: 'test-page-15-03-2024-page-12', // Same slug, but first publish
    };

    (mockReq.payload.findByID as jest.Mock).mockResolvedValue({
      id: 'media-1',
      folder: null,
      prefix: 'media',
    });
    (mockReq.payload.find as jest.Mock).mockResolvedValue({ docs: [] });

    await organizeMediaFolders({
      doc: publishedPage,
      req: mockReq as any,
      operation: 'update',
      previousDoc: previousPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    // Should reorganize on first publish (even if slug didn't change)
    expect(extractMediaFromLexical).toHaveBeenCalled();
    expect(mockReq.payload.find).toHaveBeenCalled();
    expect(mockReq.payload.update).toHaveBeenCalled();
  });

  it('should handle tenant domain extraction correctly', async () => {
    extractMediaFromLexical.mockReturnValue(['media-1']);

    const tenantWithDomain = {
      ...mockTenant,
      domain: 'warszawa.fsspx.pl',
    };

    (mockReq.payload.findByID as jest.Mock).mockResolvedValue({
      id: 'media-1',
      folder: null,
      prefix: 'media',
    });

    await organizeMediaFolders({
      doc: { ...mockPage, tenant: tenantWithDomain },
      req: mockReq as any,
      operation: 'create',
      previousDoc: mockPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    // Should extract 'warszawa' from domain
    expect(mockReq.payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'payload-folders',
        where: expect.objectContaining({
          and: expect.arrayContaining([
            expect.objectContaining({ name: { equals: 'warszawa' } }),
          ]),
        }),
      })
    );
  });

  it('should handle errors gracefully when organizing media', async () => {
    extractMediaFromLexical.mockReturnValue(['media-1', 'media-2']);

    (mockReq.payload.findByID as jest.Mock)
      .mockResolvedValueOnce({ id: 'media-1', folder: null, prefix: 'media' })
      .mockRejectedValueOnce(new Error('Media not found'));

    await organizeMediaFolders({
      doc: mockPage,
      req: mockReq as any,
      operation: 'create',
      previousDoc: mockPage,
      collection: {} as any,
      context: {} as any,
      data: {},
    });

    // Should log warning for failed media
    expect(mockReq.payload.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to organize Media media-2')
    );

    // Should still update the successful media
    expect(mockReq.payload.update).toHaveBeenCalled();
  });
});


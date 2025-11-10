import { isGeneric } from './isGeneric'
describe('isGeneric', () => {
  const mockReq = {
    payload: {
      find: jest.fn(),
    },
    i18n: {
      t: jest.fn((key: string) => key), // Return key by default for consistent testing
      language: 'en',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset i18n mock to return key
    mockReq.i18n.t = jest.fn((key: string) => key)
    mockReq.i18n.language = 'en'
  })

  it('returns true when isGeneric is false', async () => {
    const result = await isGeneric(false, { req: mockReq, data: {}, siblingData: {} })
    expect(result).toBe(true)
    expect(mockReq.payload.find).not.toHaveBeenCalled()
  })

  it('returns true when tenant is not provided', async () => {
    const result = await isGeneric(true, {
      req: mockReq,
      data: {},
      siblingData: {},
    })
    expect(result).toBe(true)
    expect(mockReq.payload.find).not.toHaveBeenCalled()
  })

  it('returns true when no other generic template exists for the tenant', async () => {
    mockReq.payload.find.mockResolvedValue({
      docs: [],
    })

    const result = await isGeneric(true, {
      req: mockReq,
      data: { tenant: 'tenant-1' },
    })

    expect(result).toBe(true)
    expect(mockReq.payload.find).toHaveBeenCalledWith({
      collection: 'feastTemplates',
      where: {
        and: [
          { tenant: { equals: 'tenant-1' } },
          { isGeneric: { equals: true } },
        ]
      },
      limit: 1,
    })
  })

  it('returns error when another generic template exists for the same tenant', async () => {
    mockReq.payload.find.mockResolvedValue({
      docs: [{ id: 'existing-1', tenant: 'tenant-1', isGeneric: true }],
    })

    const result = await isGeneric(true, {
      req: mockReq,
      data: { tenant: 'tenant-1' },
    })

    // Should return English fallback when translation key is returned
    expect(result).toBe('Only one generic template is allowed for this tenant')
    expect(mockReq.payload.find).toHaveBeenCalled()
    expect(mockReq.i18n.t).toHaveBeenCalledWith('errors.onlyOneGenericPerTenant')
  })

  it('returns true when updating and excluding self', async () => {
    mockReq.payload.find.mockResolvedValue({
      docs: [{ id: 'current-1', tenant: 'tenant-1', isGeneric: true }],
    })

    const result = await isGeneric(true, {
      req: mockReq,
      data: { tenant: 'tenant-1' },
      id: 'current-1',
    })

    expect(result).toBe(true)
    expect(mockReq.payload.find).toHaveBeenCalled()
  })

  it('returns error when another generic template exists (different from self)', async () => {
    mockReq.payload.find.mockResolvedValue({
      docs: [
        { id: 'current-1', tenant: 'tenant-1', isGeneric: true },
        { id: 'other-1', tenant: 'tenant-1', isGeneric: true },
      ],
    })

    const result = await isGeneric(true, {
      req: mockReq,
      data: { tenant: 'tenant-1' },
      id: 'current-1',
    })

    expect(result).toBe('Only one generic template is allowed for this tenant')
    expect(mockReq.i18n.t).toHaveBeenCalledWith('errors.onlyOneGenericPerTenant')
  })

  it('returns true when generic exists for different tenant', async () => {
    // Query filters by tenant-1, so should return empty (no generics for tenant-1)
    // even though tenant-2 has a generic
    mockReq.payload.find.mockResolvedValue({
      docs: [], // Empty because query is for tenant-1, not tenant-2
    })

    const result = await isGeneric(true, {
      req: mockReq,
      data: { tenant: 'tenant-1' },
    })

    expect(result).toBe(true)
    // Should not call translation since validation passes
    expect(mockReq.i18n.t).not.toHaveBeenCalled()
    expect(mockReq.payload.find).toHaveBeenCalledWith({
      collection: 'feastTemplates',
      where: {
        and: [
          { tenant: { equals: 'tenant-1' } },
          { isGeneric: { equals: true } },
        ]
      },
      limit: 1,
    })
  })

  it('handles tenant as object with id', async () => {
    mockReq.payload.find.mockResolvedValue({
      docs: [],
    })

    const result = await isGeneric(true, {
      req: mockReq,
      data: { tenant: { id: 'tenant-1' } },
    })

    expect(result).toBe(true)
    expect(mockReq.payload.find).toHaveBeenCalledWith({
      collection: 'feastTemplates',
      where: {
        and: [
          { tenant: { equals: 'tenant-1' } },
          { isGeneric: { equals: true } },
        ]
      },
      limit: 1,
    })
  })

  it('checks siblingData when data.tenant is not available', async () => {
    mockReq.payload.find.mockResolvedValue({
      docs: [],
    })

    const result = await isGeneric(true, {
      req: mockReq,
      data: {},
      siblingData: { tenant: 'tenant-1' },
    })

    expect(result).toBe(true)
    expect(mockReq.payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          and: expect.arrayContaining([
            { tenant: { equals: 'tenant-1' } },
          ]),
        }),
      })
    )
  })

  describe('translation handling', () => {
    it('uses translation function when available', async () => {
      const mockT = jest.fn((key: string) => {
        if (key === 'errors.onlyOneGenericPerTenant') {
          return 'Translated error message'
        }
        return key
      })

      mockReq.payload.find.mockResolvedValue({
        docs: [{ id: 'existing-1', tenant: 'tenant-1', isGeneric: true }],
      })

      const reqWithI18n = {
        ...mockReq,
        i18n: {
          t: mockT,
          language: 'en',
        },
      }

      const result = await isGeneric(true, {
        req: reqWithI18n,
        data: { tenant: 'tenant-1' },
      })

      expect(result).toBe('Translated error message')
      expect(mockT).toHaveBeenCalledWith('errors.onlyOneGenericPerTenant')
    })

    it('falls back to English when translation returns key', async () => {
      const mockT = jest.fn((key: string) => key) // Returns key if not found

      mockReq.payload.find.mockResolvedValue({
        docs: [{ id: 'existing-1', tenant: 'tenant-1', isGeneric: true }],
      })

      const reqWithI18n = {
        ...mockReq,
        i18n: {
          t: mockT,
          language: 'en',
        },
      }

      const result = await isGeneric(true, {
        req: reqWithI18n,
        data: { tenant: 'tenant-1' },
      })

      expect(result).toBe('Only one generic template is allowed for this tenant')
    })

    it('falls back to Polish when language is pl', async () => {
      mockReq.payload.find.mockResolvedValue({
        docs: [{ id: 'existing-1', tenant: 'tenant-1', isGeneric: true }],
      })

      const reqWithI18n = {
        ...mockReq,
        i18n: {
          language: 'pl',
        },
      }

      const result = await isGeneric(true, {
        req: reqWithI18n,
        data: { tenant: 'tenant-1' },
      })

      expect(result).toBe('Tylko jeden szablon ogólny jest dozwolony dla tej lokalizacji')
    })

    it('uses req.t if available', async () => {
      const mockT = jest.fn(() => 'Translated via req.t')

      mockReq.payload.find.mockResolvedValue({
        docs: [{ id: 'existing-1', tenant: 'tenant-1', isGeneric: true }],
      })

      const reqWithT = {
        ...mockReq,
        t: mockT,
      }

      const result = await isGeneric(true, {
        req: reqWithT,
        data: { tenant: 'tenant-1' },
      })

      expect(result).toBe('Only one generic template is allowed for this tenant')
    })
  })

  describe('error handling', () => {
    it('returns error message when payload.find throws', async () => {
      mockReq.payload.find.mockRejectedValue(new Error('Database error'))

      const result = await isGeneric(true, {
        req: mockReq,
        data: { tenant: 'tenant-1' },
      })

      expect(result).toBe('Validation error while checking generic template uniqueness')
    })
  })
})


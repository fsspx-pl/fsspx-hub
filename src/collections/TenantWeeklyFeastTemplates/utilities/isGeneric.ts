import { CheckboxFieldValidation, PayloadRequest, ValidateOptions } from "payload"

/**
 * Validates that only one generic template exists per tenant.
 * Returns true if validation passes, or an error message string if it fails.
 */
export async function isGeneric(
  value: boolean | null | undefined,
  options: ValidateOptions<any, any, any, boolean>
): Promise<true | string> {
  try {
    if (!value) return true
    const { req, data, siblingData, id } = options
    const tenantRaw = data?.tenant ?? siblingData?.tenant
    const tenantId = typeof tenantRaw === 'string' ? tenantRaw : tenantRaw?.id
    if (!tenantId) return true
    
    const res = await req.payload.find({
      collection: 'feastTemplates',
      where: {
        and: [
          { tenant: { equals: tenantId } },
          { isGeneric: { equals: true } },
        ]
      },
      limit: 1,
    })
    
    // Exclude self when updating
    const others = res.docs.filter((d: any) => d.id !== id)
    if (others.length) {
      // Try multiple ways to access translations
      const i18n = (req as any)?.i18n || (req as any)?.payload?.i18n
      const t = i18n?.t || (req as any)?.t
      const lang = i18n?.language || (req as any)?.locale || 'pl'
      
      if (t && typeof t === 'function') {
        const translated = t('errors.onlyOneGenericPerTenant')
        // If translation returns the key, it wasn't found - use fallback
        if (translated !== 'errors.onlyOneGenericPerTenant') {
          return translated
        }
      }
      // Fallback if translation not found
      return lang === 'pl'
        ? 'Tylko jeden szablon ogólny jest dozwolony dla tej lokalizacji'
        : 'Only one generic template is allowed for this tenant'
    }
    return true
  } catch (e) {
    return 'Validation error while checking generic template uniqueness'
  }
}


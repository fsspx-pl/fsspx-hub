/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): boolean {
  return !!item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export default function deepMerge<T extends Record<string, unknown>, R extends Record<string, unknown>>(target: T, source: R): T {
  let output = { ...target }
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in (target as Record<string, unknown>))) {
          Object.assign(output, { [key]: source[key] })
        } else {
          output = {
            ...output,
            [key]: deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>)
          }
        }
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }

  return output
}

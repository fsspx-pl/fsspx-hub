import { Page } from "@/payload-types"
import { format, parseISO } from "date-fns"
import { FieldHook } from "payload"

export const addPeriodStartDate: FieldHook<Page> = ({ operation, value, data }) => {
  if(operation !== 'create') {
    return value
  }
  if(!data?.period?.start) {
    return value
  }
  
  if (typeof value !== 'string') {
    return value
  }
  
  const dateSuffix = format(parseISO(data.period.start), 'dd-MM-yyyy')
  
  // Get first 8 characters from page ID (guid) if available
  const pageId = data?.id || ''
  const pageIdShort = pageId ? pageId.substring(0, 8) : ''
  
  // Check if date and guid are already appended (prevent duplicates)
  const expectedSuffix = pageIdShort ? `-${dateSuffix}-${pageIdShort}` : `-${dateSuffix}`
  if (value.endsWith(expectedSuffix)) {
    return value
  }
  
  // Remove any existing date patterns (DD-MM-YYYY) and guid patterns from the end
  // This prevents accumulation of dates if the hook runs multiple times
  // Match one or more date patterns (with optional guid) at the end
  let cleanValue = value
  // Pattern matches: -DD-MM-YYYY optionally followed by -guid (any word characters)
  const datePattern = /(-\d{2}-\d{2}-\d{4}(-\w+)?)+$/
  if (datePattern.test(cleanValue)) {
    // Remove all trailing date patterns and optional guids
    cleanValue = cleanValue.replace(datePattern, '')
  }
  
  // Format: <slug>-<date>-<8chars>
  if (pageIdShort) {
    return `${cleanValue}-${dateSuffix}-${pageIdShort}`
  }
  
  return `${cleanValue}-${dateSuffix}`
}

import { Page } from "@/payload-types"
import { format, parseISO } from "date-fns"
import { pl } from "date-fns/locale"
import { FieldHook } from "payload"

export const addPeriodStartDate: FieldHook<Page> = ({ operation, value, data }) => {
  if(operation !== 'create') {
    return value
  }
  if(!data?.period?.start) {
    return value
  }
  const dateSuffix = format(parseISO(data.period.start), 'dd-MM-yyyy', { locale: pl })
  return `${value}-${dateSuffix}`
}

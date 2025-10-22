import { User } from '@/payload-types'
import { isSuperAdmin } from '@/utilities/isSuperAdmin'
import { FieldAccess } from 'payload'

export const superAdmins: FieldAccess = args => {
  const {
    req: { user },
  } = args
  return isSuperAdmin(user as User)
}

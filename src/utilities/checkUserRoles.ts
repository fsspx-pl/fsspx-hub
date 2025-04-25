import type { User } from '../payload-types'

export const checkUserRoles = (allRoles: ('super-admin' | 'user')[] = [], user: User | null): boolean => {
  if (!user) return false
  
  return allRoles.some(role => 
    user.roles?.some(individualRole => individualRole === role)
  )
}

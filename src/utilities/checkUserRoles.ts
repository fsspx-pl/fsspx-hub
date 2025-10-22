import type { User } from '../payload-types'

export const checkUserRoles = (roles: ('super-admin' | 'user')[] = [], user: User | null): boolean => {
  if (!user) return false
  
  return roles.some(role => 
    user.roles?.some(individualRole => individualRole === role)
  )
}

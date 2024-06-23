import type { User, UserRole } from '../payload-types'

export const checkUserRoles = (allRoles: UserRole[] = [], user: User | null): boolean => {
  if (user) {
    if (
      allRoles.some(role => {
        return user?.roles?.some(individualRole => {
          return individualRole === role
        })
      })
    )
      return true
  }

  return false
}

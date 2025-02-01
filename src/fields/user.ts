
import { Field } from 'payload'
import { superAdminFieldAccess } from '../access/superAdmins'

export const user: Field = {
  name: 'user',
  type: 'relationship',
  relationTo: 'users',
  // don't require this field because we need to auto-populate it, see below
  // required: true,
  // we also don't want to hide this field because super-admins may need to manage it
  // to achieve this, create a custom component that conditionally renders the field based on the user's role
  // hidden: true,
  index: true,
  admin: {
    position: 'sidebar',
  },
  access: {
    create: superAdminFieldAccess,
    read: () => true,
    update: superAdminFieldAccess,
  },
}

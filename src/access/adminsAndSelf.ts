import { isSuperAdmin as checkIfSuperAdmin } from "../utilities/isSuperAdmin";
import { User } from "../payload-types";
import { Access } from "payload";

export const adminsAndSelf: Access<User> = async ({ req: { user } }) => {
  if (!user) {
    return false;
  }
  const isSuperAdmin = checkIfSuperAdmin(user);

  if (isSuperAdmin) {
    return true;
  }

  // allow users to read themselves and any users within the tenants they are admins of
  return {
    or: [
      {
        id: {
          equals: user.id,
        },
      },
      ...tenantAdmins(isSuperAdmin, user),
    ],
  };
};

function tenantAdmins(isSuper: boolean, user: User & { collection: "users" }) {
  return isSuper
    ? [
        {
          "tenants.tenant": {
            in: [
              typeof user?.lastLoggedInTenant === "string"
                ? user?.lastLoggedInTenant
                : user?.lastLoggedInTenant?.id,
            ].filter(Boolean),
          },
        },
      ]
    : [
        {
          "tenants.tenant": {
            in:
              user?.tenants
                ?.map(({ tenant, roles }) =>
                  roles.includes("admin")
                    ? typeof tenant === "string"
                      ? tenant
                      : tenant.id
                    : null
                ) // eslint-disable-line function-paren-newline
                .filter(Boolean) || [],
          },
        },
      ];
}

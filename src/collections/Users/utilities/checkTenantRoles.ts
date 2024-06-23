import type { Tenant, TenantRole, User } from "../../../payload-types";

export const checkTenantRoles = (
  allRoles: TenantRole[] = [],
  user?: User,
  tenant?: Tenant
): boolean => {
  if (!tenant) {
    return false;
  }
  const id = typeof tenant === "string" ? tenant : tenant?.id;
  return allRoles.some((role) => {
    return user?.tenants?.some(({ tenant: userTenant, roles }) => {
      const tenantID =
        typeof userTenant === "string" ? userTenant : userTenant?.id;
      return tenantID === id && roles?.includes(role);
    });
  });
};

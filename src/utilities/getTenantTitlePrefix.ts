import type { Settings, Tenant } from "@/payload-types";

export function getTenantTitlePrefix(
  settings: Settings | null,
  tenant: Tenant | null,
): string | null {
  if (!tenant) return null;
  if (!settings?.copyright) return null;

  const copyright = settings.copyright;
  const location = `${tenant.city} - ${tenant.type} ${tenant.patron}`;

  return `${copyright} - ${location}`;
}


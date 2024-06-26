import { Tenant } from "@/payload-types";
import { Access } from "payload";

export const lastLoggedInTenant: Access = ({ req: { user }, data }) =>
  (user?.lastLoggedInTenant as Tenant)?.id === data?.id

import { Access } from "payload";

export const lastLoggedInTenant: Access = ({ req: { user }, data }) =>
  user?.lastLoggedInTenant?.id === data?.id

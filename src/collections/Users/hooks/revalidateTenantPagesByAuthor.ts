import { revalidateTag } from "next/cache";
import { CollectionAfterChangeHook } from "payload";

export const revalidateTenantPagesByAuthor: CollectionAfterChangeHook = async ({
  doc,
  req: { payload },
  operation,
}) => {
  if (operation !== "update") return;

  if(!doc.tenants.length) return;
  const result  = await payload.find({
    collection: 'tenants',
    where: {
      id: {
        in: doc.tenants.map(({ tenant }: { tenant: string }) => tenant),
      },
    },
  });

  if(!result.docs.length) return;
  result.docs.forEach(async (tenant) => {
    await revalidateTag(`tenant:${tenant.domain}`);
    payload.logger.info(`Revalidated tag: 'tenant:${tenant.domain}'`);
  });
};

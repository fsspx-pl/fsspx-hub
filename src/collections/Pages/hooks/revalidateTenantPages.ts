import { revalidateTag } from "next/cache";
import { CollectionAfterChangeHook } from "payload";

export const revalidateTenantPages: CollectionAfterChangeHook = async ({
  doc,
  req: { payload },
  operation,
  previousDoc,
}) => {
  if (operation !== "update") return;
  if (previousDoc._status !== doc._status) return;
  if (previousDoc.campaignId !== doc.campaignId) return;

  if (!doc.tenant) return;
  const result = await payload.findByID({
    collection: "tenants",
    id: doc.tenant,
  });

  if (!result) return;
  await revalidateTag(`tenant:${result.domain}`);
  console.log(`Revalidated tag: 'tenant:${result.domain}'`);
};

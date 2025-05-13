import { revalidateTag } from "next/cache";
import { CollectionAfterChangeHook } from "payload";
import { format, parseISO } from "date-fns";
import { Page } from "@/payload-types";

export const revalidateTenantPages: CollectionAfterChangeHook<Page> = async ({
  doc,
  req: { payload },
  operation,
  previousDoc,
}) => {
  try {
    if (!['update', 'create'].includes(operation)) return;
    if (doc._status === "draft") return;
    if (operation === 'update' && previousDoc?.campaignId !== doc.campaignId) return;
    if (!doc.tenant) return;

    const tenant = await payload.findByID({
      collection: "tenants",
      id: doc.tenant as string,
    });

    if (!tenant) return;

    // Find the newest page for this tenant, including this one
    const newestPage = await payload.find({
      collection: "pages",
      where: {
        tenant: { equals: doc.tenant },
        _status: { equals: "published" }
      },
      sort: "-createdAt",
      limit: 1
    });

    if (newestPage.docs[0]?.id !== doc.id) return;

    const dateTag = `tenant:${tenant.domain}:date:${format(parseISO(doc.period.start), 'dd-MM-yyyy')}`;
    await revalidateTag(dateTag);
    payload.logger.info(`Revalidated date tag: ${dateTag}`);

    await revalidateTag(`tenant:${tenant.domain}:latest`);
    payload.logger.info(`Revalidated latest tag: tenant:${tenant.domain}:latest`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      payload.logger.error(`Error in revalidateTenantPages: ${error.message}`);
    } else {
      payload.logger.error(`Error in revalidateTenantPages: ${String(error)}`);
    }
  }
};
import { revalidateTag } from "next/cache";
import { CollectionAfterChangeHook } from "payload";
import { format, parseISO } from "date-fns";
import { Announcement } from "@/payload-types";

export const revalidateTenantPages: CollectionAfterChangeHook<Announcement> = async ({
  doc,
  req: { payload },
  operation,
  previousDoc,
}) => {
  try {
    if (!['update', 'create'].includes(operation)) return;
    if (doc._status === "draft") return;
    if (operation === 'update' && previousDoc?.newsletter?.sent !== doc.newsletter?.sent) return;
    if (!doc.tenant) return;
    if (!doc.period) return;

    const tenant = await payload.findByID({
      collection: "tenants",
      id: doc.tenant as string,
    });

    if (!tenant) return;

    const dateTag = `tenant:${tenant.domain}:date:${format(parseISO(doc.period.start), 'dd-MM-yyyy')}`;
    await revalidateTag(dateTag);
    payload.logger.info(`Revalidated date tag: ${dateTag}`);

    const newestPage = await payload.find({
      collection: "announcements",
      where: {
        tenant: { equals: doc.tenant },
        _status: { equals: "published" }
      },
      sort: "-createdAt",
      limit: 1
    });
    const isNewestPage = newestPage.docs[0]?.id === doc.id;
    if (!isNewestPage) return;
    await revalidateTag(`tenant:${tenant.domain}:latest`);
    payload.logger.info(`Revalidated latest tag: tenant:${tenant.domain}:latest`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      payload.logger.error(`Error in revalidateTenantPages: ${error.message}`);
      return;
    }
    payload.logger.error(`Error in revalidateTenantPages: ${String(error)}`);
  }
};
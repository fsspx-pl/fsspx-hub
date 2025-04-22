import { revalidateTag } from "next/cache";
import { CollectionAfterChangeHook } from "payload";
import { format } from "date-fns";

export const revalidateTenantPages: CollectionAfterChangeHook = async ({
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
      id: doc.tenant,
    });

    if (!tenant) return;

    const pageStartDate = new Date(doc.period?.start);
    const pageEndDate = doc.period?.end ? new Date(doc.period.end) : null;
    const now = new Date();

    const coversCurrentDate = now >= pageStartDate && 
      (!pageEndDate || now <= pageEndDate);
    if (!coversCurrentDate) return;

    const newestPeriodPage = await payload.find({
      collection: "pages",
      where: {
        tenant: { equals: doc.tenant },
        ['period.start']: { less_than_equal: pageStartDate },
        ['period.end']: { greater_than_equal: pageEndDate || pageStartDate },
        _status: { equals: "published" }
      },
      sort: "-createdAt",
      limit: 1
    });

    const dateTag = `tenant:${tenant.domain}:date:${format(pageStartDate, 'dd-MM-yyyy')}`;
    await revalidateTag(dateTag);
    payload.logger.info(`Revalidated date tag: ${dateTag}`);

    const isNewestPeriodPage = newestPeriodPage.docs[0]?.id === doc.id;
    if (isNewestPeriodPage) {
      await revalidateTag(`tenant:${tenant.domain}:latest`);
      payload.logger.info(`Revalidated latest tag: tenant:${tenant.domain}:latest`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      payload.logger.error(`Error in revalidateTenantPages: ${error.message}`);
    } else {
      payload.logger.error(`Error in revalidateTenantPages: ${String(error)}`);
    }
  }
};
import { revalidateTag } from "next/cache";
import { CollectionAfterChangeHook } from "payload";
import { format } from "date-fns";
import { Tenant, User } from "@/payload-types";

const revalidationProps: (keyof User)[] = ['firstName', 'lastName', 'avatar', 'salutation']

export const revalidatePagesByAuthor: CollectionAfterChangeHook = async ({
  doc,
  req: { payload },
  operation,
  previousDoc,
}) => {
  try {
    if (operation !== "update") return;
    if (!doc.tenants?.length) return;

    const shouldRevalidate = revalidationProps.filter(prop => previousDoc?.[prop] !== doc?.[prop])
    if (!shouldRevalidate.length) return;

    const pages = await payload.find({
      collection: 'pages',
      where: {
        author: {
          equals: doc.id
        },
        _status: {
          equals: 'published'
        }
      },
      depth: 1
    });

    if (!pages.docs.length) return;

    // Revalidate each specific page
    for (const page of pages.docs) {
      const tenant = page.tenant as Tenant;
      if (!tenant?.general.domain) continue;
      if (!page.period) continue;
      // Revalidate the specific date page
      const date = format(new Date(page.period.start), 'dd-MM-yyyy');
      const dateTag = `tenant:${tenant.general.domain}:date:${date}`;
      await revalidateTag(dateTag);
      payload.logger.info(`Revalidated date tag: ${dateTag} due to author change`);

      // Check if this is the newest page for its period
      const pageStartDate = new Date(page.period.start);
      const pageEndDate = page.period.end ? new Date(page.period.end) : null;

      const newestPage = await payload.find({
        collection: "pages",
        where: {
          tenant: { equals: tenant.id },
          ['period.start']: { less_than_equal: pageStartDate },
          ['period.end']: { greater_than_equal: pageEndDate || pageStartDate },
          _status: { equals: "published" }
        },
        sort: "-createdAt",
        limit: 1
      });

      if (newestPage.docs[0]?.id === page.id) {
        await revalidateTag(`tenant:${tenant.general.domain}:latest`);
        payload.logger.info(`Revalidated latest tag: tenant:${tenant.general.domain}:latest due to author change`);
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      payload.logger.error(`Error in revalidateTenantPagesByAuthor: ${error.message}`);
    } else {
      payload.logger.error(`Error in revalidateTenantPagesByAuthor: ${String(error)}`);
    }
  }
};

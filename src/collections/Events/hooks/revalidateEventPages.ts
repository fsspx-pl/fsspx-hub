import { revalidateTag } from "next/cache";
import { CollectionAfterChangeHook } from "payload";
import { Form } from "@/payload-types";

export const revalidateEventPages: CollectionAfterChangeHook<Form> = async ({
  doc,
  req: { payload },
  operation,
}) => {
  try {
    if (!['update', 'create'].includes(operation)) return;

    // Find all events that use this form
    const events = await payload.find({
      collection: 'events',
      where: {
        form: {
          equals: doc.id,
        },
      },
      depth: 1,
    });

    if (events.docs.length === 0) return;

    // Revalidate each event page
    for (const event of events.docs) {
      const tenant = typeof event.tenant === 'string' 
        ? await payload.findByID({ collection: 'tenants', id: event.tenant })
        : event.tenant;

      if (!tenant || !tenant.domain) continue;

      const domain = tenant.domain.split('.')[0];
      const tag = `event:${domain}:${event.slug}`;
      
      await revalidateTag(tag);
      payload.logger.info(`Revalidated event tag: ${tag}`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      payload.logger.error(`Error in revalidateEventPages: ${error.message}`);
      return;
    }
    payload.logger.error(`Error in revalidateEventPages: ${String(error)}`);
  }
};


import { Service, Tenant } from '@/payload-types';
import { revalidateTag } from 'next/cache';
import { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload';

export const createRevalidateServices = (errorMessage: string): CollectionAfterDeleteHook | CollectionAfterChangeHook => {
  return async ({ 
    doc, 
    req: { payload } 
  }: { 
    doc: Service; 
    req: { payload: Payload }; 
  }) => {
    try {
      const tenant = await payload.findByID({
        collection: 'tenants',
        id: typeof doc.tenant === 'string' ? doc.tenant : doc.tenant.id,
      }) as Tenant;

      if (!tenant?.general.domain) return;
      const tag = `tenant:${tenant.general.domain}:services`;
      await revalidateTag(tag);
      payload.logger.info(`Revalidated services tag: ${tag}`);
    } catch (error) {
      payload.logger.error(`${errorMessage}: ${error}`);
    }
  };
};
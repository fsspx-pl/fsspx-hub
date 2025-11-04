import { CollectionBeforeChangeHook } from "payload";
import { Page } from "@/payload-types";

export const resetNewsletterSentOnCreate: CollectionBeforeChangeHook<Page> = async ({
  operation,
  data,
}) => {
  // Reset newsletter sent status when creating (including duplicates)
  if (operation === 'create' && data?.newsletter) {
    return {
      ...data,
      newsletter: {
        ...data.newsletter,
        sent: false,
      },
    };
  }
  return data;
};


import { CollectionBeforeChangeHook } from "payload";
import { Announcement } from "@/payload-types";

export const resetNewsletterSentOnCreate: CollectionBeforeChangeHook<Announcement> = async ({
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


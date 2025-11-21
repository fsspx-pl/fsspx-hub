type PersonalizeOptions = {
  html: string;
  email: string;
  unsubscribeBaseUrl?: string;
  getSubscriptionId?: (email: string) => Promise<string | null>;
  onMissingSubscription?: (email: string) => void;
};

/**
 * Replaces the `{{UNSUBSCRIBE_URL}}` placeholder with a user-specific URL when possible.
 */
export async function personalizeUnsubscribeUrl({
  html,
  email,
  unsubscribeBaseUrl,
  getSubscriptionId,
  onMissingSubscription,
}: PersonalizeOptions): Promise<string> {
  if (!unsubscribeBaseUrl || !getSubscriptionId) {
    return html;
  }

  const subscriptionId = await getSubscriptionId(email);
  if (!subscriptionId) {
    onMissingSubscription?.(email);
    return html;
  }

  const unsubscribeUrl = `${unsubscribeBaseUrl}/${subscriptionId}`;
  return html.replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);
}


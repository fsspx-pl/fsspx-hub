export function register() {
  // No-op for initialization
}

export const onRequestError = async (
  err: Error,
  request: { headers: { cookie?: string | string[] } },
  context: unknown
) => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getPostHogServer } = await import('./src/lib/posthog-server');
    const posthog = getPostHogServer();

    if (!posthog) {
      return;
    }

    let distinctId: string | undefined = undefined;

    if (request.headers.cookie) {
      // Normalize multiple cookie arrays to string
      const cookieString = Array.isArray(request.headers.cookie)
        ? request.headers.cookie.join('; ')
        : request.headers.cookie;

      const postHogCookieMatch = cookieString.match(/ph_phc_.*?_posthog=([^;]+)/);

      if (postHogCookieMatch && postHogCookieMatch[1]) {
        try {
          const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
          const postHogData = JSON.parse(decodedCookie);
          distinctId = postHogData.distinct_id;
        } catch (e) {
          console.error('Error parsing PostHog cookie:', e);
        }
      }
    }

    await posthog.captureException(err, distinctId || undefined);
  }
};


import posthog from "posthog-js"

(function () {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.warn('NEXT_PUBLIC_POSTHOG_KEY is not set, skipping Posthog initialization');
    return;
  }
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    defaults: '2025-05-24',
    capture_exceptions: true, // This enables capturing exceptions using Error Tracking
    debug: process.env.NODE_ENV === "development",
  });
})();
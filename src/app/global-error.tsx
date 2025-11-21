'use client';

import posthog from "posthog-js";
import NextError from "next/error";
import { useEffect } from "react";
import { gothic } from "@/fonts";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    // global-error must include html and body tags
    <html className={gothic.className}>
      <body>
        {/* `NextError` is the default Next.js error page component */}
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
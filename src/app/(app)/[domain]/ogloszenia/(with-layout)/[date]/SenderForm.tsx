"use client";

import Script from "next/script";
import { useEffect, useRef } from 'react';

export const SenderScript = ({ accountId, formId }: { accountId: string, formId: string }) => (
  <>
    <Script id="sender-universal">
      {`
  (function (s, e, n, d, er) {
    s['Sender'] = er;
    s[er] = s[er] || function () {
      (s[er].q = s[er].q || []).push(arguments)
    }, s[er].l = 1 * new Date();
    var a = e.createElement(n),
        m = e.getElementsByTagName(n)[0];
    a.async = 1;
    a.src = d;
    m.parentNode.insertBefore(a, m)
  })(window, document, 'script', 'https://cdn.sender.net/accounts_resources/universal.js', 'sender');
  sender('${accountId}')
`}
    </Script>
    <Script id="sender-explicit">
      {`
if (!window.senderFormsLoaded) {
window.addEventListener("onSenderFormsLoaded", function () {
senderForms.render('${formId}')
});
}
`}
    </Script>
  </>
);

export function SenderForm({ formId }: { formId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const styleIframe = () => {
      const container = containerRef.current;
      if (!container) return;
      const iframe = container.querySelector('iframe')
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.height = '320px';
      }
      const parent = iframe?.parentElement;
      if (parent) {
        parent.style.display = 'flex';
        parent.style.justifyContent = 'center';
        parent.style.alignItems = 'center';
      }
  };

    // Listen for the Sender form render event
    const onFormRendered = () => {
      styleIframe();
    };

    // Use MutationObserver as a fallback in case the event is missed
    const observer = new MutationObserver(() => {
      styleIframe();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    // Listen for the custom event if available
    window.addEventListener('onSenderFormsLoaded', onFormRendered);

    // Try to style immediately in case the form is already rendered
    styleIframe();

    return () => {
      observer.disconnect();
      window.removeEventListener('onSenderFormsLoaded', onFormRendered);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="sender-form-field justify-self-center w-none sm:w-[424px]"
      data-sender-form-id={formId}
    />
  );
} 
'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import * as CookieConsentLib from 'vanilla-cookieconsent';
import { env } from '@/lib/core/env.client';

export function Analytics() {
  const [consentGiven, setConsentGiven] = useState(false);
  const gaId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Check cookie consent on mount and listen for changes
  useEffect(() => {
    if (!gaId) return;

    const check = () => {
      setConsentGiven(CookieConsentLib.acceptedCategory('analytics'));
    };

    // Initial check (user may have already consented in a prior session)
    check();

    // Listen for consent changes
    window.addEventListener('cc:onConsent', check);
    window.addEventListener('cc:onChange', check);

    return () => {
      window.removeEventListener('cc:onConsent', check);
      window.removeEventListener('cc:onChange', check);
    };
  }, [gaId]);

  if (!gaId || !consentGiven) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}

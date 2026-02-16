/**
 * Google Analytics 4 Event Tracking Utility
 *
 * GA4 automatically tracks: page_view, scroll, click, file_download,
 * video_start/progress/complete, and site_search via Enhanced Measurement.
 *
 * This module provides helpers for custom events specific to the site.
 * Events only fire if gtag is loaded (i.e., user accepted analytics cookies).
 */

type GTagEvent = {
    action: string;
    category?: string;
    label?: string;
    value?: number;
    [key: string]: unknown;
};

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

/** Send a custom GA4 event (no-op if gtag not loaded) */
export function trackEvent({ action, category, label, value, ...rest }: GTagEvent) {
    if (typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
        ...rest,
    });
}

// ── Pre-built event helpers ──────────────────────────────────────────

/** Track form submission */
export function trackFormSubmit(formIntent: string, formTitle?: string) {
    trackEvent({
        action: 'form_submit',
        category: 'engagement',
        label: formTitle || formIntent,
        form_intent: formIntent,
    });
}

/** Track CTA button click */
export function trackCtaClick(ctaText: string, location: string) {
    trackEvent({
        action: 'cta_click',
        category: 'engagement',
        label: ctaText,
        click_location: location,
    });
}

/** Track outbound link click */
export function trackOutboundLink(url: string) {
    trackEvent({
        action: 'outbound_click',
        category: 'navigation',
        label: url,
        outbound_url: url,
    });
}

/** Track article read (fired when user scrolls past content) */
export function trackArticleRead(articleTitle: string, slug: string) {
    trackEvent({
        action: 'article_read',
        category: 'content',
        label: articleTitle,
        article_slug: slug,
    });
}

/** Track newsletter signup */
export function trackNewsletterSignup(source: string) {
    trackEvent({
        action: 'newsletter_signup',
        category: 'conversion',
        label: source,
    });
}

/** Track search query */
export function trackSearch(query: string, resultsCount: number) {
    trackEvent({
        action: 'search',
        category: 'engagement',
        label: query,
        search_results: resultsCount,
    });
}

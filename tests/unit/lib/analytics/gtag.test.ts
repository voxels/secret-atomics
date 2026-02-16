import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  trackArticleRead,
  trackCtaClick,
  trackEvent,
  trackFormSubmit,
  trackNewsletterSignup,
  trackOutboundLink,
  trackSearch,
} from '@/lib/analytics/gtag';

describe('GA4 Event Tracking (gtag)', () => {
  let gtagMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    gtagMock = vi.fn();
    // Simulate gtag being loaded (user accepted cookies)
    Object.defineProperty(window, 'gtag', {
      value: gtagMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Clean up
    delete (window as any).gtag;
    vi.restoreAllMocks();
  });

  describe('trackEvent', () => {
    it('calls window.gtag with correct parameters', () => {
      trackEvent({
        action: 'test_event',
        category: 'testing',
        label: 'test label',
        value: 42,
      });

      expect(gtagMock).toHaveBeenCalledWith('event', 'test_event', {
        event_category: 'testing',
        event_label: 'test label',
        value: 42,
      });
    });

    it('includes extra properties in the event', () => {
      trackEvent({
        action: 'custom',
        category: 'test',
        custom_prop: 'hello',
      });

      expect(gtagMock).toHaveBeenCalledWith('event', 'custom', {
        event_category: 'test',
        event_label: undefined,
        value: undefined,
        custom_prop: 'hello',
      });
    });

    it('does nothing when gtag is not loaded (consent not given)', () => {
      delete (window as any).gtag;

      trackEvent({ action: 'should_not_fire' });

      // No error should be thrown, gtag should not be called
      expect(gtagMock).not.toHaveBeenCalled();
    });

    it('does nothing on server side (no window)', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - deliberately removing window for SSR test
      delete globalThis.window;

      expect(() => trackEvent({ action: 'ssr_test' })).not.toThrow();

      globalThis.window = originalWindow;
    });
  });

  describe('trackFormSubmit', () => {
    it('fires form_submit event with intent and title', () => {
      trackFormSubmit('contact', 'Contact Form');

      expect(gtagMock).toHaveBeenCalledWith('event', 'form_submit', {
        event_category: 'engagement',
        event_label: 'Contact Form',
        value: undefined,
        form_intent: 'contact',
      });
    });

    it('falls back to intent when title is not provided', () => {
      trackFormSubmit('newsletter');

      expect(gtagMock).toHaveBeenCalledWith('event', 'form_submit', {
        event_category: 'engagement',
        event_label: 'newsletter',
        value: undefined,
        form_intent: 'newsletter',
      });
    });
  });

  describe('trackCtaClick', () => {
    it('fires cta_click event', () => {
      trackCtaClick('Get Started', 'hero');

      expect(gtagMock).toHaveBeenCalledWith('event', 'cta_click', {
        event_category: 'engagement',
        event_label: 'Get Started',
        value: undefined,
        click_location: 'hero',
      });
    });
  });

  describe('trackOutboundLink', () => {
    it('fires outbound_click event with URL', () => {
      trackOutboundLink('https://example.com');

      expect(gtagMock).toHaveBeenCalledWith('event', 'outbound_click', {
        event_category: 'navigation',
        event_label: 'https://example.com',
        value: undefined,
        outbound_url: 'https://example.com',
      });
    });
  });

  describe('trackArticleRead', () => {
    it('fires article_read event with title and slug', () => {
      trackArticleRead('My Article', 'blog/my-article');

      expect(gtagMock).toHaveBeenCalledWith('event', 'article_read', {
        event_category: 'content',
        event_label: 'My Article',
        value: undefined,
        article_slug: 'blog/my-article',
      });
    });
  });

  describe('trackNewsletterSignup', () => {
    it('fires newsletter_signup event', () => {
      trackNewsletterSignup('footer');

      expect(gtagMock).toHaveBeenCalledWith('event', 'newsletter_signup', {
        event_category: 'conversion',
        event_label: 'footer',
        value: undefined,
      });
    });
  });

  describe('trackSearch', () => {
    it('fires search event with query and results count', () => {
      trackSearch('nextjs tutorial', 15);

      expect(gtagMock).toHaveBeenCalledWith('event', 'search', {
        event_category: 'engagement',
        event_label: 'nextjs tutorial',
        value: undefined,
        search_results: 15,
      });
    });
  });
});

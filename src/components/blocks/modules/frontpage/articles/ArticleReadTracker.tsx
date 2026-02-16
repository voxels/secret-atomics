'use client';

import { useEffect, useRef } from 'react';
import { trackArticleRead } from '@/lib/analytics/gtag';

interface ArticleReadTrackerProps {
  title: string;
  slug: string;
}

/**
 * Fires an `article_read` GA event once 60% of the article has been scrolled.
 * Renders nothing — just observes scroll depth.
 */
export default function ArticleReadTracker({ title, slug }: ArticleReadTrackerProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;

    const handleScroll = () => {
      if (firedRef.current) return;

      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;

      if (scrolled / total >= 0.6) {
        trackArticleRead(title, slug);
        firedRef.current = true;
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [title, slug]);

  return null;
}

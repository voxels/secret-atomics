/**
 * compare-to-source.ts
 *
 * Fetches all migrated articles from Sanity and their originals from noisederived.com,
 * extracts text content from both, and produces a diff report.
 *
 * Usage: npx tsx scripts/compare-to-source.ts
 */

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createClient } from '@sanity/client';
import { JSDOM } from 'jsdom';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
});

// ─── Sanity body → plain text ────────────────────────────────────────────────

function sanityBodyToText(body: any[]): string[] {
  const lines: string[] = [];
  for (const block of body) {
    if (block._type === 'block') {
      const text = block.children
        ?.filter((c: any) => c._type === 'span')
        .map((c: any) => c.text || '')
        .join('')
        .trim();
      if (text) lines.push(text);
    } else if (block._type === 'code') {
      lines.push(
        `[CODE:${block.language || 'text'}] ${(block.code || '').substring(0, 80).replace(/\n/g, '\\n')}...`
      );
    } else if (block._type === 'image') {
      lines.push('[IMAGE]');
    } else if (block._type === 'video') {
      lines.push(`[VIDEO:${block.videoId || 'unknown'}]`);
    } else {
      lines.push(`[${block._type?.toUpperCase() || 'UNKNOWN'}]`);
    }
  }
  return lines;
}

// ─── HTML → plain text ──────────────────────────────────────────────────────

function htmlToTextLines(html: string): string[] {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Find the article content — try common selectors
  const contentEl =
    doc.querySelector('article') ||
    doc.querySelector('.blog-post') ||
    doc.querySelector('[class*="article"]') ||
    doc.querySelector('[class*="post"]') ||
    doc.querySelector('[class*="content"]') ||
    doc.querySelector('main') ||
    doc.body;

  if (!contentEl) return [];

  const lines: string[] = [];
  const walker = doc.createTreeWalker(contentEl, 4 /* NodeFilter.SHOW_TEXT */);

  let current = walker.nextNode();
  while (current) {
    const text = (current.textContent || '').trim();
    if (text && text.length > 0) {
      // Skip navigation/boilerplate
      if (
        text === 'Secret Atomics' ||
        text === 'Blog' ||
        text.startsWith('©') ||
        text.startsWith('Built with')
      ) {
        current = walker.nextNode();
        continue;
      }
      lines.push(text);
    }
    current = walker.nextNode();
  }

  // Also note images and iframes
  const _images = contentEl.querySelectorAll('img');
  const _iframes = contentEl.querySelectorAll('iframe');

  return lines;
}

// ─── Simple diff ─────────────────────────────────────────────────────────────

interface DiffResult {
  missingFromMigrated: string[];
  missingFromSource: string[];
  matchedLines: number;
  totalSourceLines: number;
  totalMigratedLines: number;
}

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

function diffTexts(sourceLines: string[], migratedLines: string[]): DiffResult {
  const normalizedSource = sourceLines.map(normalizeText).filter((s) => s.length > 3);
  const normalizedMigrated = migratedLines.map(normalizeText).filter((s) => s.length > 3);

  const migratedSet = new Set(normalizedMigrated);
  const sourceSet = new Set(normalizedSource);

  const missingFromMigrated: string[] = [];
  const missingFromSource: string[] = [];
  let matched = 0;

  for (let i = 0; i < normalizedSource.length; i++) {
    if (migratedSet.has(normalizedSource[i])) {
      matched++;
    } else {
      // Check for partial match (source line contained in any migrated line)
      const partialMatch = normalizedMigrated.some(
        (m) => m.includes(normalizedSource[i]) || normalizedSource[i].includes(m)
      );
      if (!partialMatch) {
        missingFromMigrated.push(sourceLines[i]);
      } else {
        matched++;
      }
    }
  }

  for (let i = 0; i < normalizedMigrated.length; i++) {
    if (!sourceSet.has(normalizedMigrated[i])) {
      const partialMatch = normalizedSource.some(
        (s) => s.includes(normalizedMigrated[i]) || normalizedMigrated[i].includes(s)
      );
      if (!partialMatch) {
        missingFromSource.push(migratedLines[i]);
      }
    }
  }

  return {
    missingFromMigrated,
    missingFromSource,
    matchedLines: matched,
    totalSourceLines: normalizedSource.length,
    totalMigratedLines: normalizedMigrated.length,
  };
}

// ─── Fetch page ──────────────────────────────────────────────────────────────

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (migration-audit)' },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ─── Discover original URLs ─────────────────────────────────────────────────

async function discoverOriginalUrls(): Promise<string[]> {
  const html = await fetchPage('https://noisederived.com/');
  if (!html) return [];
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const links = Array.from(doc.querySelectorAll('a'))
    .map((a) => a.getAttribute('href') || '')
    .filter((href) => href.includes('/blog/') || href.includes('/articles/'))
    .filter((href) => href !== 'https://noisederived.com/blog/')
    .map((href) => (href.startsWith('http') ? href : `https://noisederived.com${href}`));
  return [...new Set(links)];
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Fetch all Sanity articles
  const articles =
    await client.fetch(`*[_type == "collection.article" && _id match "migrated-*"] | order(metadata.title asc) {
        _id,
        "title": metadata.title,
        "slug": metadata.slug.current,
        body
    }`);

  console.log(`Found ${articles.length} migrated articles in Sanity.\n`);

  // 2. Discover original URLs from noisederived.com
  const originalUrls = await discoverOriginalUrls();
  console.log(`Found ${originalUrls.length} article links on noisederived.com.\n`);

  // 3. Compare each article
  const report: any[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const article of articles) {
    const slug = article.slug;
    const title = article.title;

    // Build source URL - try multiple patterns
    const possibleUrls = [
      `https://noisederived.com/blog/${slug}/`,
      `https://noisederived.com/blog/${slug}`,
      `https://noisederived.com/${slug}/`,
      `https://noisederived.com/${slug}`,
    ];

    // Also check if any discovered URL contains the slug
    const matchedUrl = originalUrls.find((u) => u.includes(slug));
    if (matchedUrl && !possibleUrls.includes(matchedUrl)) {
      possibleUrls.unshift(matchedUrl);
    }

    let sourceHtml: string | null = null;
    let usedUrl = '';
    for (const url of possibleUrls) {
      sourceHtml = await fetchPage(url);
      if (sourceHtml) {
        usedUrl = url;
        break;
      }
    }

    // Sanity text
    const migratedLines = sanityBodyToText(article.body || []);

    if (!sourceHtml) {
      console.log(`❌ ${title}: source not found (tried ${possibleUrls[0]})`);
      report.push({
        title,
        slug,
        status: 'SOURCE_NOT_FOUND',
        migratedLineCount: migratedLines.length,
      });
      failCount++;
      continue;
    }

    // Source text
    const sourceLines = htmlToTextLines(sourceHtml);

    // Diff
    const diff = diffTexts(sourceLines, migratedLines);
    const matchPct =
      diff.totalSourceLines > 0 ? Math.round((diff.matchedLines / diff.totalSourceLines) * 100) : 0;

    const icon = matchPct >= 90 ? '✅' : matchPct >= 70 ? '🟡' : '🔴';
    console.log(
      `${icon} ${title}: ${matchPct}% match (${diff.matchedLines}/${diff.totalSourceLines} source lines found)`
    );

    if (diff.missingFromMigrated.length > 0) {
      console.log(`   Missing from migrated (${diff.missingFromMigrated.length}):`);
      for (const line of diff.missingFromMigrated.slice(0, 5)) {
        console.log(`     - "${line.substring(0, 100)}"`);
      }
      if (diff.missingFromMigrated.length > 5) {
        console.log(`     ... and ${diff.missingFromMigrated.length - 5} more`);
      }
    }

    if (diff.missingFromSource.length > 0) {
      console.log(`   Extra in migrated (${diff.missingFromSource.length}):`);
      for (const line of diff.missingFromSource.slice(0, 3)) {
        console.log(`     + "${line.substring(0, 100)}"`);
      }
      if (diff.missingFromSource.length > 3) {
        console.log(`     ... and ${diff.missingFromSource.length - 3} more`);
      }
    }

    report.push({
      title,
      slug,
      url: usedUrl,
      status: 'COMPARED',
      matchPct,
      matchedLines: diff.matchedLines,
      totalSourceLines: diff.totalSourceLines,
      totalMigratedLines: diff.totalMigratedLines,
      missingFromMigrated: diff.missingFromMigrated,
      missingFromSource: diff.missingFromSource,
    });
    successCount++;

    // Rate limit
    await new Promise((r) => setTimeout(r, 300));
  }

  // 4. Write report JSON
  const reportPath = path.join(process.cwd(), 'scripts', 'migration-diff-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to ${reportPath}`);

  // 5. Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  MIGRATION COMPARISON SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  Articles compared: ${successCount}`);
  console.log(`  Sources not found: ${failCount}`);

  const compared = report.filter((r) => r.status === 'COMPARED');
  const perfect = compared.filter((r) => r.matchPct >= 95);
  const good = compared.filter((r) => r.matchPct >= 80 && r.matchPct < 95);
  const poor = compared.filter((r) => r.matchPct < 80);

  console.log(`\n  ✅ 95%+ match: ${perfect.length}`);
  console.log(`  🟡 80-94% match: ${good.length}`);
  console.log(`  🔴 <80% match: ${poor.length}`);

  if (poor.length > 0) {
    console.log(`\n  Articles with significant differences:`);
    for (const p of poor) {
      console.log(
        `    🔴 ${p.title} (${p.matchPct}%) — ${p.missingFromMigrated.length} lines missing`
      );
    }
  }
}

main().catch(console.error);

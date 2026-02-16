import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function main() {
  const docs =
    await client.fetch(`*[_type in ["collection.article", "page"]] | order(_type, metadata.title) {
        _id, _type,
        "title": coalesce(metadata.title, title),
        "slug": metadata.slug.current,
        "seoTitle": seo.title,
        "seoDesc": seo.description,
        "hasImage": defined(seo.image.asset),
        "noIndex": seo.noIndex,
        "hasAuthors": count(authors) > 0,
        "hasCategories": count(categories) > 0,
        "hasBody": count(body) > 0,
        "publishDate": publishDate,
        "language": language
    }`);

  console.log('COMPREHENSIVE SEO & CONTENT HEALTH AUDIT\n');
  console.log('='.repeat(70));

  const issues: { doc: string; level: string; issue: string }[] = [];

  for (const d of docs) {
    const docLabel = `${d.title} (${d._type})`;

    // SEO Title checks
    if (!d.seoTitle) {
      issues.push({ doc: docLabel, level: '🔴', issue: 'Missing SEO title' });
    } else {
      if (d.seoTitle.length < 50)
        issues.push({
          doc: docLabel,
          level: '🟡',
          issue: `SEO title too short: ${d.seoTitle.length} chars (aim for 50-60)`,
        });
      if (d.seoTitle.length > 60)
        issues.push({
          doc: docLabel,
          level: '🟡',
          issue: `SEO title too long: ${d.seoTitle.length} chars (max 60)`,
        });
    }

    // SEO Description checks
    if (!d.seoDesc) {
      issues.push({ doc: docLabel, level: '🔴', issue: 'Missing SEO description' });
    } else {
      if (d.seoDesc.length < 70)
        issues.push({
          doc: docLabel,
          level: '🟡',
          issue: `SEO description too short: ${d.seoDesc.length} chars (aim for 70-160)`,
        });
      if (d.seoDesc.length > 160)
        issues.push({
          doc: docLabel,
          level: '🟡',
          issue: `SEO description too long: ${d.seoDesc.length} chars (max 160)`,
        });
    }

    // Image check (articles only)
    if (d._type === 'collection.article' && !d.hasImage) {
      issues.push({ doc: docLabel, level: '🟡', issue: 'No SEO hero image' });
    }

    // Slug check
    if (!d.slug) {
      issues.push({ doc: docLabel, level: '🔴', issue: 'Missing URL slug' });
    }

    // Author check (articles only)
    if (d._type === 'collection.article' && !d.hasAuthors) {
      issues.push({ doc: docLabel, level: '🟡', issue: 'No author assigned' });
    }

    // Category check (articles only, skip privacy policies)
    if (d._type === 'collection.article' && !d.hasCategories && !d.title?.includes('Privacy')) {
      issues.push({ doc: docLabel, level: '🟡', issue: 'No category assigned' });
    }

    // Publish date check (articles only)
    if (d._type === 'collection.article' && !d.publishDate) {
      issues.push({ doc: docLabel, level: '🟡', issue: 'No publish date' });
    }

    // Body check
    if (!d.hasBody) {
      issues.push({ doc: docLabel, level: '🟡', issue: 'No body content' });
    }
  }

  // Group by severity
  const critical = issues.filter((i) => i.level === '🔴');
  const warnings = issues.filter((i) => i.level === '🟡');

  if (critical.length > 0) {
    console.log(`\n🔴 CRITICAL ISSUES (${critical.length}):\n`);
    for (const i of critical) console.log(`  ${i.level} ${i.doc}\n     → ${i.issue}`);
  }

  if (warnings.length > 0) {
    console.log(`\n🟡 WARNINGS (${warnings.length}):\n`);
    for (const i of warnings) console.log(`  ${i.level} ${i.doc}\n     → ${i.issue}`);
  }

  if (issues.length === 0) {
    console.log('\n✅ All documents pass SEO & content health checks!');
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`Total documents: ${docs.length}`);
  console.log(`Critical: ${critical.length} | Warnings: ${warnings.length}`);
}

main().catch(console.error);

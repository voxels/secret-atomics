import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import { createClient } from '@sanity/client';

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN;

if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_TOKEN) {
  console.error('Missing Sanity configuration.');
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

async function diagnose() {
  // Fetch all migrated articles with their full body content
  const articles = await client.fetch(`*[_type == "collection.article" && _id match "migrated-*"]{
        _id,
        "title": metadata.title,
        "slug": metadata.slug.current,
        body,
        seo
    }`);

  console.log(`\n=== Found ${articles.length} migrated articles ===\n`);

  let totalIssues = 0;

  for (const article of articles) {
    const issues: string[] = [];

    if (!article.body || !Array.isArray(article.body)) {
      issues.push('  - body is missing or not an array');
    } else {
      for (let i = 0; i < article.body.length; i++) {
        const block = article.body[i];

        // Check image blocks
        if (block._type === 'image') {
          if (!block._key) {
            issues.push(`  - body[${i}]: image block missing _key`);
          }
          if (!block.asset) {
            issues.push(`  - body[${i}]: image block missing asset`);
          } else if (!block.asset._ref) {
            issues.push(`  - body[${i}]: image asset missing _ref`);
          } else if (!block.asset._type) {
            issues.push(
              `  - body[${i}]: image asset missing _type (has _ref: ${block.asset._ref})`
            );
          }
          // Check for unexpected properties
          const expectedKeys = ['_type', '_key', 'asset', 'hotspot', 'crop'];
          const unexpectedKeys = Object.keys(block).filter((k) => !expectedKeys.includes(k));
          if (unexpectedKeys.length > 0) {
            issues.push(
              `  - body[${i}]: image block has unexpected keys: ${unexpectedKeys.join(', ')}`
            );
          }
          // Show full image block structure
          issues.push(`  - body[${i}]: FULL IMAGE BLOCK: ${JSON.stringify(block)}`);
        }

        // Check text blocks for nested images in children
        if (block._type === 'block' && block.children) {
          for (let j = 0; j < block.children.length; j++) {
            const child = block.children[j];
            if (child._type === 'image') {
              issues.push(`  - body[${i}].children[${j}]: IMAGE NESTED IN TEXT BLOCK!`);
              issues.push(`    FULL: ${JSON.stringify(child)}`);
            }
            if (child._type !== 'span' && child._type !== 'image') {
              issues.push(`  - body[${i}].children[${j}]: unexpected child type: ${child._type}`);
            }
          }
          // Check block itself for _key
          if (!block._key) {
            issues.push(`  - body[${i}]: text block missing _key`);
          }
        }

        // Check for unknown block types
        const knownTypes = ['block', 'image', 'video', 'code', 'socialEmbed'];
        if (!knownTypes.includes(block._type)) {
          issues.push(`  - body[${i}]: unknown block type "${block._type}"`);
          issues.push(`    FULL: ${JSON.stringify(block)}`);
        }
      }
    }

    // Check seo.image
    if (article.seo?.image) {
      if (!article.seo.image._type) {
        issues.push(`  - seo.image: missing _type`);
      }
      if (!article.seo.image.asset) {
        issues.push(`  - seo.image: missing asset`);
      } else {
        if (!article.seo.image.asset._ref) {
          issues.push(`  - seo.image.asset: missing _ref`);
        }
        if (!article.seo.image.asset._type) {
          issues.push(`  - seo.image.asset: missing _type`);
        }
      }
    }

    if (issues.length > 0) {
      totalIssues += issues.length;
      console.log(`\n--- ${article.title} (${article._id}) ---`);
      for (const issue of issues) {
        console.log(issue);
      }
    }
  }

  if (totalIssues === 0) {
    console.log('\n✅ No structural issues found in any articles.');
  } else {
    console.log(`\n❌ Found ${totalIssues} total issues across articles.`);
  }
}

diagnose().catch(console.error);

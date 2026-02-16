import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
});

function getText(block: any): string {
  if (!block?.children) return '';
  return block.children
    .filter((c: any) => c._type === 'span')
    .map((c: any) => c.text || '')
    .join('')
    .trim();
}

async function main() {
  const articles = await client.fetch(
    `*[_type == "collection.article"]{ _id, "title": metadata.title, body } | order(metadata.title asc)`
  );
  console.log(`Scanning ${articles.length} articles for ANY remaining boilerplate...\n`);

  const BOILERPLATE = [
    /^©\d{4}/,
    /^Copyright\s*\d{4}/i,
    /^Built with\s/i,
    /^←\s/,
    /→$/,
    /^About the Author/i,
    /^Secret Atomics$/,
    /^Blog$/,
    /^Source$/,
  ];

  for (const a of articles) {
    if (!a.body) continue;
    const issues: string[] = [];
    for (let i = 0; i < a.body.length; i++) {
      const text = getText(a.body[i]);
      if (!text) continue;
      for (const p of BOILERPLATE) {
        if (p.test(text)) {
          issues.push(`  [${i}] "${text.substring(0, 80)}" (matches ${p})`);
        }
      }
    }
    if (issues.length > 0) {
      console.log(`🔴 ${a.title} (${a._id}):`);
      for (const issue of issues) console.log(issue);
      console.log();
    }
  }
  console.log('Done.');
}

main().catch(console.error);

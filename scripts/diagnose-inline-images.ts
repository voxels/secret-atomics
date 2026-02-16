import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

function deepSearch(obj: any, path: string, results: string[]) {
  if (!obj || typeof obj !== 'object') return;

  if (obj._upload_url) {
    results.push(`  ${path}: _upload_url = ${String(obj._upload_url).substring(0, 100)}`);
  }
  if (obj._type === 'image' && !obj.asset) {
    results.push(`  ${path}: IMAGE WITHOUT ASSET - keys: ${Object.keys(obj).join(', ')}`);
  }
  // Check for image children inside blocks
  if (obj._type === 'block' && Array.isArray(obj.children)) {
    for (let i = 0; i < obj.children.length; i++) {
      const c = obj.children[i];
      if (c._type !== 'span') {
        results.push(
          `  ${path}.children[${i}]: NON-SPAN type="${c._type}" - ${JSON.stringify(c).substring(0, 150)}`
        );
      }
    }
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => deepSearch(item, `${path}[${i}]`, results));
  } else {
    for (const key of Object.keys(obj)) {
      deepSearch(obj[key], `${path}.${key}`, results);
    }
  }
}

async function diagnose() {
  // Get ALL articles, not just migrated ones
  const articles = await client.fetch(`*[_type == "collection.article"]{
        _id,
        "title": metadata.title,
        body
    }`);

  console.log(`Scanning ${articles.length} articles...\n`);

  let totalIssues = 0;

  for (const a of articles) {
    const results: string[] = [];
    if (a.body) {
      deepSearch(a.body, 'body', results);
    }
    if (results.length > 0) {
      totalIssues += results.length;
      console.log(`--- ${a.title} (${a._id}) ---`);
      for (const r of results) console.log(r);
      console.log('');
    }
  }

  console.log(`=== SUMMARY: ${totalIssues} issues across ${articles.length} articles ===`);
}

diagnose().catch(console.error);

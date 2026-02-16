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

const DRY_RUN = !process.argv.includes('--apply');

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
    `*[_type == "collection.article" && _id match "migrated-*"]{ _id, "title": metadata.title, body }`
  );
  console.log(`Scanning ${articles.length} articles... Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}\n`);

  let fixed = 0;
  for (const a of articles) {
    if (!a.body || a.body.length < 2) continue;

    // Find how many leading blocks to remove
    let removeCount = 0;
    for (let i = 0; i < Math.min(6, a.body.length); i++) {
      const text = getText(a.body[i]);
      if (text === 'Secret Atomics' || text === 'Blog') {
        removeCount = i + 1;
      } else if (text !== '') {
        break; // Hit real content
      }
    }

    if (removeCount === 0) continue;

    // Also skip trailing empty blocks after "Blog"
    while (
      removeCount < a.body.length &&
      getText(a.body[removeCount]) === '' &&
      a.body[removeCount]._type === 'block'
    ) {
      removeCount++;
    }

    const removed = a.body
      .slice(0, removeCount)
      .map((b: any, i: number) => `  [${i}] "${getText(b)}" (${b._type})`);
    console.log(`${a.title}: removing ${removeCount} blocks`);
    for (const r of removed) console.log(r);

    if (!DRY_RUN) {
      const newBody = a.body.slice(removeCount);
      await client.patch(a._id).set({ body: newBody }).commit();
      console.log(`  ✅ Patched.\n`);
    }
    fixed++;
  }
  console.log(`\n${fixed} articles ${DRY_RUN ? 'would be' : ''} fixed.`);
}

main().catch(console.error);

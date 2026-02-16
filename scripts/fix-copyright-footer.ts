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
    `*[_type == "collection.article"]{ _id, "title": metadata.title, body }`
  );
  console.log(`Scanning ${articles.length} articles... Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}\n`);

  let fixed = 0;
  for (const article of articles) {
    if (!article.body) continue;

    // Find the Copyright line
    let cutIdx = -1;
    for (let i = article.body.length - 1; i >= Math.max(0, article.body.length - 20); i--) {
      const text = getText(article.body[i]);
      if (/^Copyright\s*\d{4}/i.test(text)) {
        cutIdx = i;
        break;
      }
    }
    if (cutIdx === -1) continue;

    const removed = article.body.slice(cutIdx);
    const newBody = article.body.slice(0, cutIdx);

    // Trim trailing empty blocks
    while (
      newBody.length > 0 &&
      getText(newBody[newBody.length - 1]) === '' &&
      newBody[newBody.length - 1]._type === 'block'
    ) {
      newBody.pop();
    }

    console.log(
      `${article.title} (${article._id}): removing ${removed.length} blocks from index ${cutIdx}`
    );
    for (const r of removed) {
      console.log(`  "${getText(r).substring(0, 80)}" (${r._type})`);
    }

    if (!DRY_RUN) {
      await client.patch(article._id).set({ body: newBody }).commit();
      console.log(`  ✅ Patched.\n`);
    }
    fixed++;
  }

  console.log(`\n${fixed} articles ${DRY_RUN ? 'would be' : ''} fixed.`);
}

main().catch(console.error);

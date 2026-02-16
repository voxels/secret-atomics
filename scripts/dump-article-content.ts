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
  const articles =
    await client.fetch(`*[_type == "collection.article"] | order(metadata.title asc) {
        _id, "title": metadata.title, body
    }`);

  for (const a of articles) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`ARTICLE: ${a.title} (${a._id})`);
    console.log(`${'='.repeat(80)}`);
    if (!a.body) {
      console.log('[No body]');
      continue;
    }

    // Print all text blocks
    for (const block of a.body) {
      if (block._type === 'block') {
        const text = getText(block);
        if (text) console.log(`[${block.style || 'normal'}] ${text.substring(0, 200)}`);
      } else if (block._type === 'code') {
        console.log(
          `[CODE:${block.language || 'text'}] ${(block.code || '').substring(0, 60).replace(/\n/g, '\\n')}...`
        );
      } else {
        console.log(`[${block._type}]`);
      }
    }
  }
}

main().catch(console.error);

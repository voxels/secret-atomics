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

async function main() {
  // Search ALL document types that could have body/content with block styles
  const docs =
    await client.fetch(`*[defined(body) && count(body[_type == "block" && style in ["h5","h6"]]) > 0]{
        _id, _type, "title": coalesce(metadata.title, title, name), body
    }`);

  console.log(
    `Found ${docs.length} documents with h5/h6 blocks. Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}\n`
  );

  let totalFixed = 0;

  for (const doc of docs) {
    let modified = false;
    const changes: string[] = [];

    for (let i = 0; i < doc.body.length; i++) {
      const block = doc.body[i];
      if (block._type === 'block' && (block.style === 'h5' || block.style === 'h6')) {
        const text =
          block.children
            ?.map((c: any) => c.text || '')
            .join('')
            .trim() || '';
        changes.push(`  [${i}] ${block.style}→h4: "${text.substring(0, 60)}"`);
        block.style = 'h4';
        modified = true;
        totalFixed++;
      }
    }

    if (modified) {
      console.log(`${doc._type} "${doc.title}" (${doc._id}): ${changes.length} fixes`);
      for (const c of changes.slice(0, 5)) console.log(c);
      if (changes.length > 5) console.log(`  ... and ${changes.length - 5} more`);

      if (!DRY_RUN) {
        await client.patch(doc._id).set({ body: doc.body }).commit();
        console.log(`  ✅ Patched.\n`);
      }
    }
  }

  console.log(`\nTotal h5/h6→h4 fixes: ${totalFixed}`);
  if (DRY_RUN && totalFixed > 0) console.log('DRY RUN — run with --apply to make changes.');
}

main().catch(console.error);

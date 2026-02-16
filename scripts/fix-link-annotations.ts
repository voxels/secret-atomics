/**
 * fix-link-annotations.ts
 *
 * Migrated articles have link annotations with { href: "..." } but the schema expects:
 *   { _type: 'link', type: 'external', external: 'https://...' }
 *
 * This script finds all markDefs with href and converts them to the proper format.
 *
 * Usage:
 *   npx tsx scripts/fix-link-annotations.ts          # dry-run
 *   npx tsx scripts/fix-link-annotations.ts --apply   # apply
 */

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
  const articles = await client.fetch(
    `*[_type == "collection.article" && _id match "migrated-*"]{ _id, "title": metadata.title, body }`
  );
  console.log(`Scanning ${articles.length} articles... Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}\n`);

  let totalLinks = 0;
  let totalFixed = 0;
  let articlesFixed = 0;

  for (const article of articles) {
    if (!article.body) continue;

    let modified = false;
    const changes: string[] = [];

    for (let i = 0; i < article.body.length; i++) {
      const block = article.body[i];
      if (block._type !== 'block') continue;
      if (!block.markDefs || !Array.isArray(block.markDefs)) continue;

      for (let j = 0; j < block.markDefs.length; j++) {
        const def = block.markDefs[j];
        totalLinks++;

        // Check for old href format
        if (def.href && !def.external) {
          const url = def.href;
          changes.push(
            `  ✏️  [${i}] markDef "${def._key}": href="${url.substring(0, 60)}" → type=external, external="${url.substring(0, 60)}"`
          );

          // Convert to new format
          def._type = 'link';
          def.type = 'external';
          def.external = url;
          delete def.href;

          totalFixed++;
          modified = true;
        }
        // Also check for any other unknown fields
        else if (def.href && def.external) {
          // Has both — just remove href
          changes.push(`  🗑  [${i}] markDef "${def._key}": removing redundant href`);
          delete def.href;
          modified = true;
        }
      }
    }

    if (modified) {
      articlesFixed++;
      console.log(`${article.title}:`);
      for (const c of changes.slice(0, 10)) console.log(c);
      if (changes.length > 10) console.log(`  ... and ${changes.length - 10} more`);

      if (!DRY_RUN) {
        await client.patch(article._id).set({ body: article.body }).commit();
        console.log(`  ✅ Patched.\n`);
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`  Total link annotations scanned: ${totalLinks}`);
  console.log(`  Links fixed (href→external): ${totalFixed}`);
  console.log(`  Articles affected: ${articlesFixed}`);
  if (DRY_RUN) console.log(`  DRY RUN — run with --apply to make changes.`);
  console.log(`${'='.repeat(50)}`);
}

main().catch(console.error);

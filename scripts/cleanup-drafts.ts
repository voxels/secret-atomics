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

const APPLY = process.argv.includes('--apply');

async function main() {
  const all = await client.fetch(
    `*[_type == "collection.article" && _id match "*migrated-*"]{ _id, "title": metadata.title }`
  );
  const published = all.filter((a: any) => !a._id.startsWith('drafts.'));
  const drafts = all.filter((a: any) => a._id.startsWith('drafts.'));

  console.log(`Published: ${published.length}`);
  console.log(`Drafts: ${drafts.length}`);

  const pubIds = new Set(published.map((a: any) => a._id));
  const duplicateDrafts = drafts.filter((a: any) => pubIds.has(a._id.replace('drafts.', '')));
  const orphanDrafts = drafts.filter((a: any) => !pubIds.has(a._id.replace('drafts.', '')));

  console.log(`\nDuplicate drafts (published version exists): ${duplicateDrafts.length}`);
  for (const d of duplicateDrafts) {
    console.log(`  ${d._id} → "${d.title}"`);
  }

  console.log(`\nOrphan drafts (NO published version): ${orphanDrafts.length}`);
  for (const d of orphanDrafts) {
    console.log(`  ${d._id} → "${d.title}"`);
  }

  if (APPLY && duplicateDrafts.length > 0) {
    console.log(`\nDeleting ${duplicateDrafts.length} duplicate drafts...`);
    for (const d of duplicateDrafts) {
      await client.delete(d._id);
      console.log(`  🗑  Deleted: ${d._id}`);
    }
    console.log('Done.');
  } else if (duplicateDrafts.length > 0) {
    console.log(`\nDRY RUN — run with --apply to delete duplicate drafts.`);
  }
}

main().catch(console.error);

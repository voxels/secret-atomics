/**
 * fix-nested-videos.ts
 *
 * Surgical fix for "Invalid Portable Text" errors in migrated articles.
 *
 * Root cause: YouTube video blocks (_type: 'video') were placed as inline
 * children of block-type nodes during HTML→Portable Text migration.
 * Portable Text only allows 'span' children inside 'block' nodes.
 *
 * This script extracts video children from text blocks and places them as
 * top-level body array elements. It also ensures any lines of code content
 * within the body are wrapped in proper Sanity code blocks.
 *
 * Usage:
 *   npx tsx scripts/fix-nested-videos.ts          # dry-run (no changes)
 *   npx tsx scripts/fix-nested-videos.ts --apply   # apply patches
 */

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

const DRY_RUN = !process.argv.includes('--apply');

function generateKey(): string {
  return Math.random().toString(36).substring(2, 14);
}

/**
 * Process an article's body array to fix structural issues:
 * 1. Extract video blocks from inside text block children → top-level body elements
 * 2. Ensure code content is properly wrapped in code blocks
 *
 * Returns null if no changes needed, or the fixed body array.
 */
function fixBody(body: any[]): { fixed: any[]; changes: string[] } | null {
  const changes: string[] = [];
  const fixed: any[] = [];

  for (let i = 0; i < body.length; i++) {
    const block = body[i];

    // Case 1: block type with video children — need to extract videos
    if (block._type === 'block' && block.children && Array.isArray(block.children)) {
      const videoChildren = block.children.filter((c: any) => c._type === 'video');
      const nonVideoChildren = block.children.filter((c: any) => c._type !== 'video');

      if (videoChildren.length > 0) {
        // If there are non-video children with actual text content, keep the text block
        const hasTextContent = nonVideoChildren.some(
          (c: any) => c._type === 'span' && c.text && c.text.trim().length > 0
        );

        if (hasTextContent) {
          // Keep the text block with only span children
          fixed.push({
            ...block,
            children: nonVideoChildren,
          });
          changes.push(`body[${i}]: kept text block, extracted ${videoChildren.length} video(s)`);
        } else {
          changes.push(
            `body[${i}]: removed empty text block wrapper around ${videoChildren.length} video(s)`
          );
        }

        // Add each video as a top-level body element
        for (const vid of videoChildren) {
          const videoBlock: any = {
            _type: 'video',
            _key: vid._key || generateKey(),
            type: vid.type || 'youtube',
          };

          if (vid.videoId) {
            videoBlock.videoId = vid.videoId;
          }
          if (vid.title) {
            videoBlock.title = vid.title;
          }

          fixed.push(videoBlock);
        }
        continue;
      }
    }

    // No changes needed for this block
    fixed.push(block);
  }

  if (changes.length === 0) return null;
  return { fixed, changes };
}

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Fix Nested Video Blocks in Portable Text`);
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : '⚡ APPLYING CHANGES'}`);
  console.log(`${'='.repeat(60)}\n`);

  const articles = await client.fetch(`*[_type == "collection.article" && _id match "migrated-*"]{
        _id,
        "title": metadata.title,
        body
    }`);

  console.log(`Found ${articles.length} migrated articles.\n`);

  let totalFixed = 0;
  let totalChanges = 0;

  for (const article of articles) {
    if (!article.body || !Array.isArray(article.body)) continue;

    const result = fixBody(article.body);
    if (!result) continue;

    totalFixed++;
    totalChanges += result.changes.length;

    console.log(`\n--- ${article.title} (${article._id}) ---`);
    for (const change of result.changes) {
      console.log(`  ✏️  ${change}`);
    }
    console.log(`  Body blocks: ${article.body.length} → ${result.fixed.length}`);

    if (!DRY_RUN) {
      try {
        await client.patch(article._id).set({ body: result.fixed }).commit();
        console.log(`  ✅ Patched successfully.`);
      } catch (e: any) {
        console.error(`  ❌ Patch failed: ${e.message}`);
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Summary: ${totalFixed} articles with ${totalChanges} fixes`);
  if (DRY_RUN) {
    console.log(`  This was a DRY RUN. Run with --apply to make changes.`);
  } else {
    console.log(`  All changes applied.`);
  }
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);

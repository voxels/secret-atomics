/**
 * fix-bylines-and-h5.ts
 *
 * 1. Removes author/date byline blocks like "Michael Edgcumbe ·June 1st, 2018 –1 minute read"
 * 2. Converts h5 styled blocks to h4 (h5 not in article schema)
 *
 * Usage:
 *   npx tsx scripts/fix-bylines-and-h5.ts          # dry-run
 *   npx tsx scripts/fix-bylines-and-h5.ts --apply   # apply
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

function getText(block: any): string {
    if (!block?.children) return '';
    return block.children
        .filter((c: any) => c._type === 'span')
        .map((c: any) => c.text || '')
        .join('')
        .trim();
}

// Match byline patterns like:
// "Michael Edgcumbe ·June 1st, 2018 –1 minute read"
// "Secret Atomics ·January 16th, 2024 –1 minute read"
const BYLINE_PATTERN = /^.+·.+\d{4}\s*[–-]\s*\d+\s*minute\s*read$/;

async function main() {
    const articles = await client.fetch(`*[_type == "collection.article" && _id match "migrated-*"]{ _id, "title": metadata.title, body }`);
    console.log(`Scanning ${articles.length} articles... Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}\n`);

    let totalBylines = 0;
    let totalH5 = 0;
    let articlesFixed = 0;

    for (const article of articles) {
        if (!article.body) continue;

        let modified = false;
        const changes: string[] = [];
        const newBody: any[] = [];

        for (let i = 0; i < article.body.length; i++) {
            const block = article.body[i];

            // Check for byline
            if (block._type === 'block') {
                const text = getText(block);
                if (BYLINE_PATTERN.test(text)) {
                    changes.push(`  🗑  [${i}] Byline: "${text.substring(0, 80)}"`);
                    totalBylines++;
                    modified = true;
                    continue; // skip this block
                }
            }

            // Check for h5 style
            if (block._type === 'block' && block.style === 'h5') {
                changes.push(`  ✏️  [${i}] h5→h4: "${getText(block).substring(0, 60)}"`);
                block.style = 'h4';
                totalH5++;
                modified = true;
            }

            newBody.push(block);
        }

        if (modified) {
            articlesFixed++;
            console.log(`${article.title}:`);
            for (const c of changes) console.log(c);

            if (!DRY_RUN) {
                await client.patch(article._id).set({ body: newBody }).commit();
                console.log(`  ✅ Patched.\n`);
            }
        }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`  Bylines removed: ${totalBylines}`);
    console.log(`  h5→h4 conversions: ${totalH5}`);
    console.log(`  Articles affected: ${articlesFixed}`);
    if (DRY_RUN) console.log(`  DRY RUN — run with --apply to make changes.`);
    console.log(`${'='.repeat(50)}`);
}

main().catch(console.error);

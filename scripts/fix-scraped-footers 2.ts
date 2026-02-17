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

// Broad footer patterns
const FOOTER_PATTERNS = [
    /^©\d{4}/,                              // ©2023, Secret Atomics
    /^Copyright\s+\d{4}/i,                  // Copyright 2023
    /^Built with\s/i,                       // Built with Contentful and Gatsby
    /^←\s/,                                 // ← Previous article
    /→$/,                                   // Next article →
    /^About the Author\s*→?$/i,             // About the Author →
    /^Source$/,                              // Stray "Source" text
];

function isFooterBlock(text: string): boolean {
    return FOOTER_PATTERNS.some(p => p.test(text));
}

// Check if text looks like mashed-together tags (no spaces, short, no sentences)
function isTagBlock(text: string): boolean {
    if (!text || text.length > 120) return false;
    // Tags have no periods or sentence structure, often camelCase-mashed words
    return !text.includes('. ') && !text.includes('? ') && !text.includes('! ');
}

async function main() {
    const articles = await client.fetch(`*[_type == "collection.article"]{ _id, "title": metadata.title, body }`);
    console.log(`Scanning ${articles.length} articles... Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}\n`);

    let fixed = 0;

    for (const article of articles) {
        if (!article.body || article.body.length < 3) continue;

        // Scan backwards for the first footer-like block
        let cutIdx = -1;
        for (let i = article.body.length - 1; i >= Math.max(0, article.body.length - 25); i--) {
            const text = getText(article.body[i]);
            if (/^(©|Copyright)\s*\d{4}/i.test(text) || /^Built with\s/i.test(text)) {
                cutIdx = i;
                // Keep scanning backwards to find the earliest footer block
                for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
                    const prev = getText(article.body[j]);
                    if (prev === '' || isFooterBlock(prev)) {
                        cutIdx = j;
                    } else {
                        break;
                    }
                }
                break;
            }
        }

        if (cutIdx === -1) continue;

        const removed = article.body.slice(cutIdx);
        let newBody = article.body.slice(0, cutIdx);

        // Trim trailing empty blocks
        while (newBody.length > 0 && getText(newBody[newBody.length - 1]) === '' && newBody[newBody.length - 1]._type === 'block') {
            newBody.pop();
        }

        console.log(`${article.title} (${article._id}): removing ${removed.length} trailing blocks from index ${cutIdx}`);
        for (const r of removed) {
            const t = getText(r);
            console.log(`  [${r._type}] "${t.substring(0, 80)}"`);
        }

        if (!DRY_RUN) {
            await client.patch(article._id).set({ body: newBody }).commit();
            console.log(`  ✅ Patched.\n`);
        }
        fixed++;
    }

    console.log(`\n${fixed} articles ${DRY_RUN ? 'would be' : ''} fixed.`);
    if (DRY_RUN && fixed > 0) console.log('DRY RUN — run with --apply to make changes.');
}

main().catch(console.error);

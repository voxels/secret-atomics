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
    useCdn: false, // Ensure fresh data
    apiVersion: '2024-01-01',
});

async function verify() {
    try {
        const count = await client.fetch(`count(*[_type == "collection.article" && _id match "migrated-*"])`);
        console.log(`Migrated Articles Count: ${count}`);

        const articles = await client.fetch(`*[_type == "collection.article" && _id match "migrated-*"]{
            "title": metadata.title,
            _id,
            "hasImage": defined(seo.image),
            "slug": metadata.slug.current,
            "publishDate": publishDate,
            body
        }`);
        console.log('Sample Articles:', JSON.stringify(articles.slice(0, 3), null, 2));

        // Verify content structure
        // 1. No images in block children
        // 2. Dates are YYYY-MM-DD
        // 3. Videos have valid IDs

        let errors = 0;

        for (const doc of articles) {
            if (doc.publishDate && doc.publishDate.includes('T')) {
                console.error(`[FAIL] ${doc.title}: Date has time component (${doc.publishDate})`);
                errors++;
            }

            if (doc.body) {
                for (const block of doc.body) {
                    if (block._type === 'block' && block.children) {
                        const hasImage = block.children.some((c: any) => c._type === 'image');
                        if (hasImage) {
                            console.error(`[FAIL] ${doc.title}: Image found inside text block!`);
                            errors++;
                        }
                    }
                    if (block._type === 'video' && block.type === 'youtube') {
                        if (!block.videoId || block.videoId.includes('http')) {
                            console.error(`[FAIL] ${doc.title}: Video ID looks like a URL (${block.videoId})`);
                            errors++;
                        }
                    }
                }
            }
        }

        if (errors === 0) {
            console.log('Verification PASSED: All checks green.');
        } else {
            console.log(`Verification FAILED with ${errors} errors.`);
            process.exit(1);
        }
    } catch (e) {
        console.error('Verification failed:', e);
    }
}

verify();

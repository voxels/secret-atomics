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

async function check() {
    const articles = await client.fetch(`*[_type == "collection.article" && _id match "migrated-*"]{
        _id,
        "title": metadata.title,
        body
    }`);

    let totalVidsNested = 0;
    let articlesAffected = 0;

    for (const a of articles) {
        if (!a.body) continue;
        let articleHasIssue = false;
        for (let i = 0; i < a.body.length; i++) {
            const b = a.body[i];
            if (b._type === 'block' && b.children) {
                const vidKids = b.children.filter((c: any) => c._type === 'video');
                if (vidKids.length > 0) {
                    if (!articleHasIssue) {
                        articlesAffected++;
                        articleHasIssue = true;
                    }
                    totalVidsNested += vidKids.length;

                    // Show first example per article
                    if (totalVidsNested <= 3) {
                        console.log(`\n=== Example: "${a.title}" body[${i}] ===`);
                        console.log(JSON.stringify(b, null, 2));
                    }
                }
            }
        }
    }

    console.log(`\n\n=== SUMMARY ===`);
    console.log(`Total articles: ${articles.length}`);
    console.log(`Articles with nested videos: ${articlesAffected}`);
    console.log(`Total nested video blocks: ${totalVidsNested}`);
}

check().catch(console.error);

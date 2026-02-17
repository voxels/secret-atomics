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
    // Fetch all articles with their body and current seo.image
    const articles = await client.fetch(`*[_type == "collection.article"]{
        _id,
        "title": metadata.title,
        "hasHeroImage": defined(seo.image.asset),
        body
    } | order(metadata.title asc)`);

    console.log(`Scanning ${articles.length} articles... Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}\n`);

    let fixed = 0;
    let alreadySet = 0;
    let noImage = 0;

    for (const article of articles) {
        if (article.hasHeroImage) {
            console.log(`✅ ${article.title}: already has hero image`);
            alreadySet++;
            continue;
        }

        if (!article.body) {
            console.log(`⚠️  ${article.title}: no body`);
            noImage++;
            continue;
        }

        // Find the first image block in the body
        const firstImage = article.body.find((b: any) => b._type === 'image' && b.asset?._ref);

        if (!firstImage) {
            console.log(`⚠️  ${article.title}: no image blocks in body`);
            noImage++;
            continue;
        }

        console.log(`✏️  ${article.title}`);
        console.log(`   First image asset: ${firstImage.asset._ref}`);

        if (!DRY_RUN) {
            await client.patch(article._id).set({
                'seo.image': {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: firstImage.asset._ref,
                    },
                },
            }).commit();
            console.log(`   ✅ Set as hero image.\n`);
        }
        fixed++;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`  Already had hero: ${alreadySet}`);
    console.log(`  Set from body: ${fixed}`);
    console.log(`  No images available: ${noImage}`);
    if (DRY_RUN && fixed > 0) console.log(`  DRY RUN — run with --apply to make changes.`);
    console.log(`${'='.repeat(50)}`);
}

main().catch(console.error);

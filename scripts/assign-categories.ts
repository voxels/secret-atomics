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

// Category definitions
const CATEGORIES: { name: string; slug: string }[] = [
    { name: 'VR & Immersive', slug: 'vr-immersive' },
    { name: 'Spatial Computing', slug: 'spatial-computing' },
    { name: 'Physical Computing', slug: 'physical-computing' },
    { name: 'Computer Vision', slug: 'computer-vision' },
    { name: 'AI & Machine Learning', slug: 'ai-machine-learning' },
    { name: 'iOS & Software Engineering', slug: 'ios-software-engineering' },
];

// Article → category assignments (by slug match)
const ASSIGNMENTS: Record<string, string[]> = {
    'migrated-comparing-vr-rendering-models': ['vr-immersive'],
    'migrated-creating-a-youtube-vr-video-in-unreal': ['vr-immersive'],
    'migrated-rebuilding-a-vr-landscape': ['vr-immersive'],
    'migrated-rendering-from-unreal-engine-5-to-led-panels-over-a-wireless-connection': ['vr-immersive'],
    'migrated-exploring-data-visualization-on-the-vision-pro': ['spatial-computing'],
    'migrated-know-maps-a-visionos-place-discovery-app': ['spatial-computing'],
    'migrated-modeling-an-led-strip-in-visionos': ['spatial-computing'],
    'migrated-know-maps-privacy-policy': ['spatial-computing'],
    'migrated-delivering-interactive-graphics-wirelessly-to-an-led-matrix': ['physical-computing'],
    'migrated-iterating-the-design-of-a-volumetric-display': ['physical-computing'],
    'migrated-iterating-the-design-of-a-volumetric-display-retrospective-and-v4-plan': ['physical-computing'],
    'migrated-new-years-eve-party': ['physical-computing'],
    'migrated-prototyping-with-tensegrity': ['physical-computing'],
    'migrated-creating-a-metahuman-with-an-intel-realsense-depth-camera': ['computer-vision'],
    'migrated-detecting-gestures-from-the-motion-of-the-body-in-relation-to-itself': ['computer-vision'],
    'migrated-generating-interactive-particle-systems-in-opencv-and-spritekit': ['computer-vision'],
    'migrated-measuring-and-visualizing-motion-of-the-body-relative-to-itself': ['computer-vision'],
    'migrated-tips-in-implementing-tensorflow-lite-to-use-movenet-models-in-c': ['computer-vision'],
    'migrated-using-nuitrack-skeleton-tracking-to-drive-a-metahuman-skeleton': ['computer-vision'],
    'migrated-streaming-chatgpt-results-to-a-view-using-swifts-asyncsequence': ['ai-machine-learning'],
    'migrated-the-dilemma-of-using-chatgpt-in-the-interview-process': ['ai-machine-learning'],
    'migrated-tips-on-tasks-from-chatgpt-4o': ['ai-machine-learning'],
    'migrated-eliminating-collection-view-tearing-with-xcodes-time-profiler-instrument': ['ios-software-engineering'],
    'migrated-experimenting-with-data-explorers': ['ios-software-engineering'],
    'migrated-working-across-platforms-and-teams-on-google-maps': ['ios-software-engineering'],
    'migrated-tula-house-privacy-policy': ['ios-software-engineering'],
};

async function main() {
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}\n`);

    // 1. Check for existing categories
    const existing = await client.fetch(`*[_type == "article.category"]{ _id, title, "slug": slug.current }`);
    console.log(`Existing categories: ${existing.length}`);
    for (const e of existing) {
        const titleText = Array.isArray(e.title) ? e.title[0]?.value : e.title;
        console.log(`  ${e._id}: "${titleText}" (/${e.slug})`);
    }

    // 2. Create missing categories
    const categoryIdMap: Record<string, string> = {};

    for (const cat of CATEGORIES) {
        const found = existing.find((e: any) => e.slug === cat.slug);
        if (found) {
            categoryIdMap[cat.slug] = found._id;
            console.log(`\n✅ Category "${cat.name}" already exists: ${found._id}`);
        } else {
            const docId = `category-${cat.slug}`;
            console.log(`\n+ Creating category "${cat.name}" (${docId})`);

            if (!DRY_RUN) {
                const created = await client.createOrReplace({
                    _id: docId,
                    _type: 'article.category',
                    title: [{ _key: 'en', value: cat.name }],
                    slug: { _type: 'slug', current: cat.slug },
                });
                categoryIdMap[cat.slug] = created._id;
                console.log(`  ✅ Created: ${created._id}`);
            } else {
                categoryIdMap[cat.slug] = docId;
            }
        }
    }

    // 3. Assign categories to articles
    console.log(`\n--- Assigning categories ---\n`);
    let assigned = 0;

    for (const [articleId, catSlugs] of Object.entries(ASSIGNMENTS)) {
        const refs = catSlugs.map(slug => ({
            _type: 'reference',
            _ref: categoryIdMap[slug],
            _key: Math.random().toString(36).substring(2, 10),
        }));

        console.log(`${articleId} → [${catSlugs.join(', ')}]`);

        if (!DRY_RUN) {
            await client.patch(articleId).set({ categories: refs }).commit();
        }
        assigned++;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`  Categories created: ${CATEGORIES.length - existing.length}`);
    console.log(`  Articles assigned: ${assigned}`);
    if (DRY_RUN) console.log(`  DRY RUN — run with --apply to make changes.`);
    console.log(`${'='.repeat(50)}`);
}

main().catch(console.error);

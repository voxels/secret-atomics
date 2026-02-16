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
    // Find Michael Edgcumbe person doc
    const persons = await client.fetch(`*[_type == "person"]{ _id, name }`);
    console.log('Person documents:');
    for (const p of persons) console.log(`  ${p._id}: "${p.name}"`);

    const michael = persons.find((p: any) => p.name?.includes('Michael'));
    if (!michael) {
        console.error('Michael Edgcumbe person document not found!');
        return;
    }
    console.log(`\nUsing: ${michael._id} ("${michael.name}")\n`);

    // Find articles missing authors
    const articles = await client.fetch(`*[_type == "collection.article" && _id match "migrated-*"]{ _id, "title": metadata.title, authors }`);
    const missing = articles.filter((a: any) => !a.authors || a.authors.length === 0);

    console.log(`Articles missing authors: ${missing.length}/${articles.length}\n`);

    if (missing.length === 0) {
        console.log('All articles already have authors.');
        return;
    }

    for (const a of missing) {
        console.log(`  + ${a.title}`);
        if (!DRY_RUN) {
            await client.patch(a._id).set({
                authors: [{ _type: 'reference', _ref: michael._id, _key: Math.random().toString(36).substring(2, 10) }]
            }).commit();
        }
    }

    console.log(`\n${missing.length} articles ${DRY_RUN ? 'would be' : ''} updated.`);
    if (DRY_RUN) console.log('DRY RUN — run with --apply to make changes.');
}

main().catch(console.error);

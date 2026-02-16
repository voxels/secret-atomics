
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

async function cleanup() {
    try {
        console.log('Fetching documents to delete...');
        const query = `*[_type == "collection.article" && _id match "migrated-*"]._id`;
        const ids = await client.fetch(query);

        if (ids.length === 0) {
            console.log('No migrated documents found to delete.');
            return;
        }

        console.log(`Deleting ${ids.length} documents...`);
        const transaction = client.transaction();
        ids.forEach((id: string) => transaction.delete(id));
        await transaction.commit();
        console.log('Cleanup complete.');
    } catch (e) {
        console.error('Cleanup failed:', e);
    }
}

cleanup();

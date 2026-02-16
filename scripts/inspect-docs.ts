import { createClient } from 'next-sanity';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function inspectDocs() {
  const docs = await client.fetch(`*[_type == "collection.documentation"]{
    _id,
    title,
    language,
    "collectionRef": collection._ref,
    "collectionSlug": collection->metadata.slug.current
  }`);

  console.log('Documentation Documents:', JSON.stringify(docs, null, 2));

  const collections = await client.fetch(`*[_type == "collection"]{
    _id,
    title,
    metadata { slug }
  }`);

  console.log('Collections:', JSON.stringify(collections, null, 2));
}

inspectDocs();

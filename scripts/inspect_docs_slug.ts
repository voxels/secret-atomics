
import { client } from '@/sanity/lib/client';

async function inspectDocsCollection() {
    const query = `*[_type == "collection.documentation"][0] {
    _id,
    title,
    metadata {
      slug { current }
    }
  }`;

    const doc = await client.fetch(query);
    console.log('Docs Collection:', JSON.stringify(doc, null, 2));
}

inspectDocsCollection();

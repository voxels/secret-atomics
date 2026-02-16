import { client } from '@/sanity/lib/client';

async function inspectAboutPage() {
  const query = `*[_type in ["page", "collection.documentation"] && metadata.slug.current == "about"][0] {
    _id,
    _type,
    title,
    metadata,
    modules[] {
      _type,
      _key
    }
  }`;

  const doc = await client.fetch(query);
  console.log('About Page Document:', JSON.stringify(doc, null, 2));
}

inspectAboutPage();

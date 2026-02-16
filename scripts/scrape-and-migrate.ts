import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { htmlToBlocks } from '@sanity/block-tools';
import { createClient } from '@sanity/client';
import { Schema } from '@sanity/schema';
import { JSDOM } from 'jsdom';

// --- Configuration ---
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN;

if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_TOKEN) {
  console.error(
    'Missing Sanity configuration. Ensure NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_WRITE_TOKEN are set.'
  );
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

// Minimal schema definition for block-tools
const defaultSchema = Schema.compile({
  name: 'default',
  types: [
    {
      type: 'object',
      name: 'blogPost',
      fields: [
        {
          title: 'Body',
          name: 'body',
          type: 'array',
          of: [{ type: 'block' }, { type: 'image' }],
        },
      ],
    },
  ],
});

const blockContentType = defaultSchema
  .get('blogPost')
  .fields.find((field: any) => field.name === 'body').type;

// --- Helpers ---

// Download image to temp file (using fetch for better protocol handling)
async function downloadImage(url: string, filepath: string): Promise<string> {
  // Fix malformed URLs like "http:/_gatsby" -> "https://noisederived.com/_gatsby"
  if (url.startsWith('http:/') && !url.startsWith('http://')) {
    url = url.replace('http:/', 'https://noisederived.com/');
  }
  // Handle relative URLs
  if (url.startsWith('//')) url = `https:${url}`;
  if (!url.startsWith('http')) {
    url = `https://noisederived.com${url.startsWith('/') ? '' : '/'}${url}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

// Upload image to Sanity
async function uploadToSanity(filePath: string): Promise<string | null> {
  try {
    const fileStream = fs.createReadStream(filePath);
    const asset = await client.assets.upload('image', fileStream, {
      filename: path.basename(filePath),
    });
    return asset._id;
  } catch (error) {
    console.error(`Failed to upload image ${filePath}:`, error);
    return null;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

// --- Main Scraper Logic ---

async function fetchPage(url: string): Promise<Document> {
  const res = await fetch(url);
  const text = await res.text();
  const dom = new JSDOM(text);
  return dom.window.document;
}

// Extract article links from homepage
async function getArticleLinks(): Promise<string[]> {
  console.log('Fetching homepage...');
  const doc = await fetchPage('https://noisederived.com/');
  const links = Array.from(doc.querySelectorAll('a[href^="/blog/"]'))
    .map((a) => (a as any).href)
    .filter((href) => href !== 'https://noisederived.com/blog/') // Exclude index if present
    // make unique
    .filter((value, index, self) => self.indexOf(value) === index);

  // Normalize URLs
  return links.map((link) => (link.startsWith('http') ? link : `https://noisederived.com${link}`));
}

async function processArticle(url: string) {
  try {
    console.log(`Processing ${url}...`);
    const doc = await fetchPage(url);

    // 1. Metadata
    let title = doc.querySelector('h1')?.textContent?.trim() || 'Untitled';
    // Remove "Secret Atomics" suffix if present (common in titles)
    title = title.replace(' | Secret Atomics', '');

    // Attempt to find date. Often in a <time> tag or just text.
    let dateText = doc.querySelector('time')?.textContent?.trim();
    if (!dateText) {
      const dateRegex =
        /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(st|nd|rd|th)?,\s+\d{4}/;
      const bodyText = doc.body.textContent || '';
      const match = bodyText.match(dateRegex);
      if (match) dateText = match[0];
    }

    let publishDate = new Date().toISOString().split('T')[0];
    if (dateText) {
      const cleanDate = dateText.replace(/(st|nd|rd|th),/, ',');
      const parsed = Date.parse(cleanDate);
      if (!Number.isNaN(parsed)) publishDate = new Date(parsed).toISOString().split('T')[0];
    }

    const slug = url.split('/').filter(Boolean).pop() || slugify(title);

    // 2. Hero Image
    let heroImageId = null;
    const heroImageUrl = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');

    // Ignore default social images if known (optional refinement)
    // if (heroImageUrl?.includes('default-social')) heroImageUrl = null;

    if (heroImageUrl) {
      const tmpKey = crypto.randomBytes(16).toString('hex');
      const tmpPath = path.join('/tmp', `${tmpKey}_hero.jpg`);
      try {
        await downloadImage(heroImageUrl, tmpPath);
        heroImageId = await uploadToSanity(tmpPath);
        fs.unlinkSync(tmpPath);
      } catch (e) {
        console.warn(`Failed to process hero image ${heroImageUrl}:`, e);
      }
    }

    // 3. Content Body
    const contentContainer =
      doc.querySelector('.post-content') || doc.querySelector('article') || doc.body;

    const h1 = contentContainer.querySelector('h1');
    if (h1 && h1.textContent?.trim() === title) h1.remove();

    // Unwrap images using recursive lift strategy
    // Bubbles images up until they are direct children of contentContainer
    const allImages = Array.from(contentContainer.querySelectorAll('img'));

    for (const img of allImages) {
      const current = img;
      // Lift until parent is contentContainer
      // Add depth check to prevent infinite loops
      let depth = 0;
      while (current.parentNode && current.parentNode !== contentContainer && depth < 20) {
        const parent = current.parentNode;
        const grandparent = parent.parentNode;

        if (!grandparent) break;

        const pre = parent.cloneNode(false);
        const post = parent.cloneNode(false);

        const childNodes = Array.from(parent.childNodes);
        const idx = childNodes.indexOf(current as unknown as ChildNode);

        // Move siblings
        for (let i = 0; i < idx; i++) {
          pre.appendChild(childNodes[i]);
        }
        for (let i = idx + 1; i < childNodes.length; i++) {
          post.appendChild(childNodes[i]);
        }

        // Insert parts into grandparent
        if (pre.childNodes.length > 0) grandparent.insertBefore(pre, parent);
        grandparent.insertBefore(current, parent);
        if (post.childNodes.length > 0) grandparent.insertBefore(post, parent);

        // Remove original parent (it's been split)
        grandparent.removeChild(parent);

        depth++;
      }
    }

    // Cleanup empty elements left behind by splitting
    // Iterate relevant tags and remove if empty text content (and no children like iframes/imgs)
    const emptyCandidates = contentContainer.querySelectorAll('p, div, span, strong, em, a');
    emptyCandidates.forEach((el) => {
      if (el.textContent?.trim() === '' && el.children.length === 0) {
        el.remove();
      }
    });

    // 4. Convert HTML to Portable Text
    // Deserializer fix: undefined tagName
    let blocks = htmlToBlocks(contentContainer.innerHTML, blockContentType, {
      parseHtml: (html) => new JSDOM(html).window.document,
      rules: [
        {
          deserialize(el, _next, _block) {
            const element = el as unknown as HTMLElement;
            // SAFEGUARD: Check if element and tagName exist
            if (!element || !element.tagName) return undefined;

            const tagName = element.tagName.toLowerCase();

            // Handle Images
            if (tagName === 'img') {
              const imageUrl = element.getAttribute('src');
              if (!imageUrl) return undefined;
              // Skip base64 data URIs (lazy load placeholders)
              if (imageUrl.startsWith('data:')) return undefined;

              return {
                _type: 'image',
                _upload_url: imageUrl,
              };
            }
            // Handle IFrames (Video)
            if (tagName === 'iframe') {
              const src = element.getAttribute('src');
              if (src && (src.includes('youtube') || src.includes('youtu.be'))) {
                // Extract YouTube Key
                let videoId = src;
                const match = src.match(
                  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
                );
                if (match?.[1]) {
                  videoId = match[1];
                }

                return {
                  _type: 'video',
                  type: 'youtube',
                  videoId: videoId,
                };
              }
            }
            return undefined;
          },
        },
      ],
    });

    // FLATTEN BLOCKS: Ensure no images are nested inside text blocks
    // If a block has children of type 'image', split it.
    const flatBlocks: any[] = [];
    for (const b of blocks) {
      const block = b as any;
      if (
        block._type === 'block' &&
        block.children &&
        block.children.some((c: any) => c._type === 'image')
      ) {
        let currentBlock = { ...block, children: [] };

        for (const child of block.children) {
          if (child._type === 'image') {
            // Push current text block if it has content
            if (currentBlock.children.length > 0) {
              flatBlocks.push(currentBlock);
            }
            // Push image as top-level block
            flatBlocks.push(child);
            // Reset current text block
            currentBlock = { ...block, children: [] };
          } else {
            currentBlock.children.push(child);
          }
        }
        // Push final text block
        if (currentBlock.children.length > 0) {
          flatBlocks.push(currentBlock);
        }
      } else {
        flatBlocks.push(block);
      }
    }
    blocks = flatBlocks;

    // Post-process blocks to upload images
    for (const b of blocks) {
      const block = b as any;
      if (block._type === 'image' && block._upload_url) {
        const url = block._upload_url;
        delete block._upload_url;

        const tmpKey = crypto.randomBytes(16).toString('hex');
        const tmpPath = path.join('/tmp', `${tmpKey}_body.jpg`);
        try {
          await downloadImage(url, tmpPath);
          const assetId = await uploadToSanity(tmpPath);
          if (assetId) {
            block.asset = { _type: 'reference', _ref: assetId };
          } else {
            // If upload failed, maybe just leave it without asset (Validation error likely)
            // or remove the block. Best to remove.
          }
          if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        } catch (e) {
          console.warn(`Failed to process body image ${url}:`, e);
        }
      }
    }

    const validBlocks = blocks.filter((b: any) => !(b._type === 'image' && !b.asset));

    // 5. Create Document
    const docData = {
      _type: 'collection.article',
      _id: `migrated-${slug}`, // Deterministic ID
      metadata: {
        title: title,
        slug: { _type: 'slug', current: slug },
      },
      publishDate: publishDate,
      body: validBlocks,
      seo: {
        image: heroImageId
          ? { _type: 'image', asset: { _type: 'reference', _ref: heroImageId } }
          : undefined,
        description: title,
      },
      language: 'en',
    };

    await client.createOrReplace(docData);
    console.log(`Migrated: ${title}`);
  } catch (error) {
    console.error(`Failed to process article ${url}:`, error);
  }
}

// --- Execution ---
(async () => {
  try {
    const links = await getArticleLinks();
    console.log(`Found ${links.length} articles.`);

    for (const link of links) {
      await processArticle(link);
    }
    console.log('Migration complete!');
  } catch (e) {
    console.error('Migration failed:', e);
  }
})();

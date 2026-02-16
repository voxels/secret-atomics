/**
 * fix-draft-portable-text.ts
 *
 * Comprehensive fix for Invalid Portable Text in DRAFT article documents.
 * 
 * Fixes three types of issues:
 * 1. Image blocks with _upload_url nested as children of text blocks
 *    - Base64 placeholders → skipped (garbage data)
 *    - Gatsby URLs → extract real Contentful URL from query param, download & upload
 *    - Contentful/direct URLs → download & upload
 * 2. YouTube embeds (_type: 'youtube') nested as children of text blocks
 *    → Extract to top-level video blocks with proper schema
 * 3. Video blocks (_type: 'video') nested as children (same fix as published)
 *
 * Usage:
 *   npx tsx scripts/fix-draft-portable-text.ts          # dry-run
 *   npx tsx scripts/fix-draft-portable-text.ts --apply   # apply
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

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

const DRY_RUN = !process.argv.includes('--apply');

function generateKey(): string {
    return Math.random().toString(36).substring(2, 14);
}

/**
 * Resolve a _upload_url to a downloadable URL.
 * - Base64 data URIs → null (skip, these are lazy-load placeholders)
 * - Gatsby image URLs → extract real URL from `u=` query param
 * - Protocol-relative URLs (//assets.ctfassets.net) → prepend https:
 * - Direct URLs → return as-is
 */
function resolveImageUrl(uploadUrl: string): string | null {
    // Skip base64 data URIs — these are tiny placeholder images
    if (uploadUrl.startsWith('data:')) return null;

    // Gatsby image proxy URLs: extract the real URL from query param `u=`
    if (uploadUrl.includes('/_gatsby/image/')) {
        const match = uploadUrl.match(/[?&]u=([^&]+)/);
        if (match) {
            return decodeURIComponent(match[1]);
        }
        return null; // Can't extract real URL
    }

    // Protocol-relative URLs
    if (uploadUrl.startsWith('//')) {
        return 'https:' + uploadUrl;
    }

    // Relative URLs that look like paths
    if (uploadUrl.startsWith('/')) {
        return 'https://noisederived.com' + uploadUrl;
    }

    // Already a full URL
    if (uploadUrl.startsWith('http')) {
        return uploadUrl;
    }

    return null;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
    if (!url) return null;

    // youtube.com/embed/ID
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&#]+)/);
    if (embedMatch) return embedMatch[1];

    // youtube.com/watch?v=ID
    const watchMatch = url.match(/[?&]v=([^&#]+)/);
    if (watchMatch) return watchMatch[1];

    // youtu.be/ID
    const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
    if (shortMatch) return shortMatch[1];

    // Already an ID (no slashes)
    if (!url.includes('/') && !url.includes('.') && url.length === 11) {
        return url;
    }

    return url; // Return as-is if we can't parse it
}

async function downloadImage(url: string, filepath: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(arrayBuffer));
    return filepath;
}

async function uploadToSanity(filePath: string): Promise<string | null> {
    try {
        const fileStream = fs.createReadStream(filePath);
        const asset = await client.assets.upload('image', fileStream, {
            filename: path.basename(filePath),
        });
        return asset._id;
    } catch (error) {
        console.error(`  ❌ Upload failed for ${filePath}:`, error);
        return null;
    }
}

interface FixResult {
    fixed: any[];
    changes: string[];
    needsUpload: { blockIndex: number; url: string }[];
}

/**
 * Process body array: extract non-span children to top-level blocks.
 */
function fixBody(body: any[]): FixResult | null {
    const changes: string[] = [];
    const fixed: any[] = [];
    const needsUpload: { blockIndex: number; url: string }[] = [];

    for (let i = 0; i < body.length; i++) {
        const block = body[i];

        if (block._type === 'block' && block.children && Array.isArray(block.children)) {
            const spanChildren: any[] = [];
            const extractedBlocks: any[] = [];

            for (const child of block.children) {
                if (child._type === 'span') {
                    spanChildren.push(child);
                } else if (child._type === 'image') {
                    const uploadUrl = child._upload_url;
                    const resolvedUrl = uploadUrl ? resolveImageUrl(uploadUrl) : null;

                    if (resolvedUrl) {
                        // Real image that needs to be downloaded and uploaded
                        const imageBlock = {
                            _type: 'image',
                            _key: child._key || generateKey(),
                            _pending_upload: resolvedUrl, // marker for upload step
                        };
                        extractedBlocks.push(imageBlock);
                        changes.push(`body[${i}]: extracted image for upload: ${resolvedUrl.substring(0, 80)}`);
                    } else if (uploadUrl && uploadUrl.startsWith('data:')) {
                        // Base64 placeholder — skip
                        changes.push(`body[${i}]: removed base64 placeholder image`);
                    } else if (child.asset) {
                        // Image with asset — just extract to top-level
                        const imageBlock = {
                            _type: 'image',
                            _key: child._key || generateKey(),
                            asset: child.asset,
                        };
                        extractedBlocks.push(imageBlock);
                        changes.push(`body[${i}]: extracted image with existing asset`);
                    } else {
                        changes.push(`body[${i}]: removed broken image (no asset, no resolvable URL)`);
                    }
                } else if (child._type === 'youtube') {
                    // _type: 'youtube' with url field → convert to video block
                    const videoId = extractYouTubeId(child.url || '');
                    if (videoId) {
                        extractedBlocks.push({
                            _type: 'video',
                            _key: child._key || generateKey(),
                            type: 'youtube',
                            videoId: videoId,
                        });
                        changes.push(`body[${i}]: converted youtube embed to video block (${videoId})`);
                    } else {
                        changes.push(`body[${i}]: removed youtube block with unparseable URL: ${child.url}`);
                    }
                } else if (child._type === 'video') {
                    // Video nested in block — extract
                    const videoBlock: any = {
                        _type: 'video',
                        _key: child._key || generateKey(),
                        type: child.type || 'youtube',
                    };
                    if (child.videoId) videoBlock.videoId = child.videoId;
                    extractedBlocks.push(videoBlock);
                    changes.push(`body[${i}]: extracted nested video block`);
                } else {
                    // Unknown type — keep as span fallback
                    spanChildren.push(child);
                    changes.push(`body[${i}]: kept unknown child type "${child._type}" as-is`);
                }
            }

            if (extractedBlocks.length > 0) {
                // Keep text block if it has meaningful text content
                const hasText = spanChildren.some(
                    (c: any) => c.text && c.text.trim().length > 0
                );
                if (hasText) {
                    fixed.push({ ...block, children: spanChildren });
                }
                // Add extracted blocks as top-level elements
                for (const eb of extractedBlocks) {
                    const idx = fixed.length;
                    fixed.push(eb);
                    if (eb._pending_upload) {
                        needsUpload.push({ blockIndex: idx, url: eb._pending_upload });
                    }
                }
                continue;
            }
        }

        // Also handle top-level image blocks with _upload_url
        if (block._type === 'image' && block._upload_url && !block.asset) {
            const resolvedUrl = resolveImageUrl(block._upload_url);
            if (resolvedUrl) {
                const idx = fixed.length;
                fixed.push({
                    _type: 'image',
                    _key: block._key || generateKey(),
                    _pending_upload: resolvedUrl,
                });
                needsUpload.push({ blockIndex: idx, url: resolvedUrl });
                changes.push(`body[${i}]: top-level image queued for upload: ${resolvedUrl.substring(0, 80)}`);
                continue;
            } else if (block._upload_url.startsWith('data:')) {
                changes.push(`body[${i}]: removed top-level base64 placeholder`);
                continue; // skip it
            }
        }

        fixed.push(block);
    }

    if (changes.length === 0) return null;
    return { fixed, changes, needsUpload };
}

async function main() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  Fix Draft Portable Text (Images + Videos)`);
    console.log(`  Mode: ${DRY_RUN ? 'DRY RUN' : '⚡ APPLYING CHANGES'}`);
    console.log(`${'='.repeat(60)}\n`);

    // Get ALL articles (published + drafts)
    const articles = await client.fetch(`*[_type == "collection.article"]{
        _id,
        "title": metadata.title,
        body
    }`);

    console.log(`Found ${articles.length} total articles.\n`);

    let totalFixed = 0;
    let totalChanges = 0;
    let totalUploads = 0;

    for (const article of articles) {
        if (!article.body || !Array.isArray(article.body)) continue;

        const result = fixBody(article.body);
        if (!result) continue;

        totalFixed++;
        totalChanges += result.changes.length;

        console.log(`\n--- ${article.title} (${article._id}) ---`);
        for (const change of result.changes) {
            console.log(`  ✏️  ${change}`);
        }
        console.log(`  📦 ${result.needsUpload.length} images to upload`);
        console.log(`  Body: ${article.body.length} → ${result.fixed.length} blocks`);

        if (!DRY_RUN) {
            // Upload images
            for (const upload of result.needsUpload) {
                const tmpKey = crypto.randomBytes(16).toString('hex');
                const ext = upload.url.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)?.[1] || 'jpg';
                const tmpPath = path.join('/tmp', `${tmpKey}_fix.${ext}`);

                try {
                    console.log(`  ⬇️  Downloading: ${upload.url.substring(0, 80)}...`);
                    await downloadImage(upload.url, tmpPath);
                    const assetId = await uploadToSanity(tmpPath);
                    if (assetId) {
                        const block = result.fixed[upload.blockIndex];
                        delete block._pending_upload;
                        block.asset = { _type: 'reference', _ref: assetId };
                        totalUploads++;
                        console.log(`  ✅ Uploaded → ${assetId}`);
                    }
                    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
                } catch (e: any) {
                    console.error(`  ❌ Failed to process ${upload.url}: ${e.message}`);
                    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
                }
            }

            // Remove any blocks that still have _pending_upload (failed uploads)
            const cleanBody = result.fixed.filter((b: any) => !b._pending_upload);

            // Also clean _upload_url from any remaining blocks
            for (const b of cleanBody) {
                delete b._upload_url;
            }

            try {
                await client.patch(article._id).set({ body: cleanBody }).commit();
                console.log(`  ✅ Patched document.`);
            } catch (e: any) {
                console.error(`  ❌ Patch failed: ${e.message}`);
            }
        }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`  Summary: ${totalFixed} articles, ${totalChanges} fixes, ${totalUploads} images uploaded`);
    if (DRY_RUN) {
        console.log(`  DRY RUN — run with --apply to make changes.`);
    }
    console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);

/**
 * fix-code-blocks.ts
 *
 * Converts identified text blocks containing code into proper Sanity `code` blocks.
 * Each target is manually verified — only confirmed code content is converted.
 *
 * Usage:
 *   npx tsx scripts/fix-code-blocks.ts          # dry-run
 *   npx tsx scripts/fix-code-blocks.ts --apply   # apply
 */

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

function generateKey(): string {
  return Math.random().toString(36).substring(2, 14);
}

function getBlockText(block: any): string {
  if (!block.children) return '';
  return block.children
    .filter((c: any) => c._type === 'span')
    .map((c: any) => c.text || '')
    .join('');
}

/**
 * For blocks where prose and code are mixed, split the prose prefix from the code.
 * Returns { prose: string | null, code: string }
 */
function splitProseAndCode(
  text: string,
  codeStart: string
): { prose: string | null; code: string } {
  const idx = text.indexOf(codeStart);
  if (idx <= 0) return { prose: null, code: text.trim() };

  const prose = text.substring(0, idx).trim();
  const code = text.substring(idx).trim();
  return { prose: prose || null, code };
}

interface CodeTarget {
  articleId: string;
  language: string;
  textMatch: string;
  codeStartsAt?: string; // If the code starts mid-block, what string starts the code
}

// Manually verified code blocks to convert
const CODE_TARGETS: CodeTarget[] = [
  // Streaming ChatGPT: two full Swift functions
  {
    articleId: 'migrated-streaming-chatgpt-results-to-a-view-using-swifts-asyncsequence',
    language: 'swift',
    textMatch: 'public func query(',
  },
  {
    articleId: 'migrated-streaming-chatgpt-results-to-a-view-using-swifts-asyncsequence',
    language: 'swift',
    textMatch: 'internal func fetchBytes(',
  },
  // Rebuilding a VR Landscape: C# Build.cs snippets
  {
    articleId: 'migrated-rebuilding-a-vr-landscape',
    language: 'csharp',
    textMatch: 'PublicDependencyModuleNames.AddRange',
    codeStartsAt: 'PublicDependencyModuleNames',
  },
  {
    articleId: 'migrated-rebuilding-a-vr-landscape',
    language: 'csharp',
    textMatch: 'PrivateDependencyModuleNames.AddRange',
  },
  // Rebuilding a VR Landscape: C++ include
  {
    articleId: 'migrated-rebuilding-a-vr-landscape',
    language: 'cpp',
    textMatch: '#include "Components/InstancedStaticMeshComponent.h"',
  },
  // TensorFlow Lite: C++ input tensor code
  {
    articleId: 'migrated-tips-in-implementing-tensorflow-lite-to-use-movenet-models-in-c',
    language: 'cpp',
    textMatch: 'typed_input_tensor',
  },
];

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Fix Code Blocks`);
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN' : '⚡ APPLYING CHANGES'}`);
  console.log(`${'='.repeat(60)}\n`);

  let totalConverted = 0;

  // Group targets by article
  const articleIds = [...new Set(CODE_TARGETS.map((t) => t.articleId))];

  for (const articleId of articleIds) {
    const article = await client.fetch(`*[_id == $id][0]{ _id, "title": metadata.title, body }`, {
      id: articleId,
    });

    if (!article) {
      console.log(`  ❌ Article not found: ${articleId}`);
      continue;
    }

    const targets = CODE_TARGETS.filter((t) => t.articleId === articleId);
    console.log(`\n--- ${article.title} ---`);

    let modified = false;
    const body: any[] = [];

    for (let i = 0; i < article.body.length; i++) {
      const block = article.body[i];
      if (block._type !== 'block') {
        body.push(block);
        continue;
      }

      const text = getBlockText(block);
      if (!text.trim()) {
        body.push(block);
        continue;
      }

      // Check if this block matches any target
      const target = targets.find((t) => text.includes(t.textMatch));
      if (!target) {
        body.push(block);
        continue;
      }

      // Handle prose/code split if needed
      if (target.codeStartsAt) {
        const { prose, code } = splitProseAndCode(text, target.codeStartsAt);

        if (prose) {
          // Keep prose as its own text block
          body.push({
            _type: 'block',
            _key: generateKey(),
            children: [{ _type: 'span', _key: generateKey(), marks: [], text: prose }],
            markDefs: [],
            style: 'normal',
          });
          console.log(`  ✏️  body[${i}]: split prose: "${prose.substring(0, 60)}..."`);
        }

        body.push({
          _type: 'code',
          _key: block._key || generateKey(),
          language: target.language,
          code: code,
        });
        console.log(`  ✏️  body[${i}]: code (${target.language}): "${code.substring(0, 60)}..."`);
      } else {
        body.push({
          _type: 'code',
          _key: block._key || generateKey(),
          language: target.language,
          code: text.trim(),
        });
        console.log(
          `  ✏️  body[${i}]: text → code (${target.language}): "${text.substring(0, 60)}..."`
        );
      }

      modified = true;
      totalConverted++;
    }

    if (modified && !DRY_RUN) {
      try {
        await client.patch(article._id).set({ body }).commit();
        console.log(`  ✅ Patched.`);
      } catch (e: any) {
        console.error(`  ❌ Patch failed: ${e.message}`);
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Converted ${totalConverted} text blocks to code blocks.`);
  if (DRY_RUN) console.log(`  DRY RUN — run with --apply to make changes.`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);

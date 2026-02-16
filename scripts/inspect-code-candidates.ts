import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2024-01-01',
});

// Broader scan: look for any block whose text contains code-like multi-line content
// or code syntax that was clearly meant to be formatted as code
async function main() {
  const articles = await client.fetch(`*[_type == "collection.article" && _id match "migrated-*"]{
        _id,
        "title": metadata.title,
        body
    }`);

  for (const article of articles) {
    if (!article.body) continue;

    const codeBlocks: { idx: number; text: string }[] = [];

    for (let i = 0; i < article.body.length; i++) {
      const block = article.body[i];
      if (block._type !== 'block') continue;

      const text =
        block.children
          ?.filter((c: any) => c._type === 'span')
          .map((c: any) => c.text || '')
          .join('') || '';

      if (!text.trim()) continue;

      // Multi-line text with code indicators (newlines in single block = code)
      const lines = text.split('\n');
      if (lines.length > 2) {
        const codeLineCount = lines.filter((l) => {
          const trimmed = l.trim();
          return (
            /[{};()]/.test(trimmed) ||
            /^\s*(if|else|for|while|return|let|var|const|func|guard|import|class|struct|try|catch|throw)\s/.test(
              trimmed
            ) ||
            /^\s*(public|private|internal|static)\s/.test(trimmed) ||
            /^\s*\/\//.test(trimmed) ||
            /^\s*#(include|import|define)/.test(trimmed) ||
            /\.$/.test(trimmed) ||
            trimmed === '{' ||
            trimmed === '}' ||
            trimmed === ''
          );
        }).length;

        if (codeLineCount >= lines.length * 0.4) {
          codeBlocks.push({ idx: i, text });
        }
      }

      // Single-line definite code patterns
      if (lines.length <= 2) {
        const trimmed = text.trim();
        if (
          /^#include\s/.test(trimmed) ||
          /^import\s+\w/.test(trimmed) ||
          /^(public|private|internal)\s+(func|class|var|let)\s/.test(trimmed) ||
          /^\w+\.\w+\(.*\)\s*;\s*$/.test(trimmed) ||
          /^(PublicDependencyModuleNames|PrivateDependencyModuleNames)\b/.test(trimmed) ||
          /\.\w+\([^)]*\);\s*$/.test(trimmed)
        ) {
          codeBlocks.push({ idx: i, text });
        }
      }
    }

    if (codeBlocks.length > 0) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`${article.title} (${article._id})`);
      console.log(`Total body blocks: ${article.body.length}`);
      console.log(
        `Existing code blocks: ${article.body.filter((b: any) => b._type === 'code').length}`
      );
      console.log(`${'='.repeat(80)}`);

      for (const cb of codeBlocks) {
        console.log(`\n  📝 body[${cb.idx}]:`);
        // Show first 500 chars
        const preview = cb.text.substring(0, 500);
        for (const line of preview.split('\n')) {
          console.log(`    | ${line}`);
        }
        if (cb.text.length > 500) console.log(`    ... (${cb.text.length} total chars)`);
      }
    }
  }
}

main().catch(console.error);

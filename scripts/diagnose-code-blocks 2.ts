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

async function check() {
    const articles = await client.fetch(`*[_type == "collection.article" && _id match "migrated-*"]{
        _id,
        "title": metadata.title,
        body
    }`);

    let codeBlockCount = 0;
    let codeStyleCount = 0;
    let examples = 0;

    for (const a of articles) {
        if (!a.body) continue;
        for (let i = 0; i < a.body.length; i++) {
            const b = a.body[i];

            // Check for existing code blocks
            if (b._type === 'code') {
                codeBlockCount++;
            }

            // Check for blocks with 'code' style (from htmlToBlocks)
            if (b._type === 'block' && b.style === 'code') {
                codeStyleCount++;
                if (examples < 3) {
                    const text = b.children?.map((c: any) => c.text).join('') || '';
                    console.log(`\n=== Code-style block: "${a.title}" body[${i}] ===`);
                    console.log(`Text preview: ${text.substring(0, 200)}`);
                    console.log(`Full block: ${JSON.stringify(b)}`);
                    examples++;
                }
            }

            // Check for text blocks containing what looks like code
            if (b._type === 'block' && b.style === 'normal' && b.children) {
                const text = b.children.map((c: any) => c.text || '').join('');
                // Heuristics for code-like content
                const codeIndicators = [
                    /^\s*(import |from |const |let |var |function |class |def |return |if \(|for \(|while \()/,
                    /[{}();]\s*$/,
                    /=>/,
                    /\{\{|\}\}/,
                ];
                // Don't flag short fragments
                if (text.length > 30) {
                    const hits = codeIndicators.filter(rx => rx.test(text));
                    if (hits.length >= 2 && examples < 6) {
                        console.log(`\n=== Possible code in normal block: "${a.title}" body[${i}] ===`);
                        console.log(`Text: ${text.substring(0, 200)}`);
                        examples++;
                    }
                }
            }
        }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Existing code blocks (_type: 'code'): ${codeBlockCount}`);
    console.log(`Blocks with style='code': ${codeStyleCount}`);
}

check().catch(console.error);

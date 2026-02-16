/**
 * diagnose-code-content.ts
 * 
 * Scans all published migrated articles for text blocks that contain
 * code-like content which should be wrapped in Sanity `code` blocks.
 * 
 * Heuristics for detecting code:
 * - Lines containing common code patterns (=, {}, (), ;, =>, ->, etc.)
 * - Lines with function/class/import/var/let/const keywords
 * - Lines with indentation patterns typical of code
 * - Backtick-wrapped inline code
 * - Lines that look like terminal commands
 * - Lines with file paths or URLs that look like code references
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@sanity/client';

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: '2024-01-01',
});

// Patterns that strongly indicate code content
const CODE_PATTERNS = [
    // Language keywords with context
    /^(import|from|export|const|let|var|function|class|def|return|if|else|for|while|switch|case|try|catch|throw|new|async|await|yield|struct|enum|protocol|extension|guard|override)\s/,
    // Assignment / declarations
    /^\s*(self\.|this\.|let |var |const |val |auto |int |float |double |string |bool |void |char )/,
    // Function calls / method chains
    /\.\w+\([^)]*\)/,
    // Arrow functions
    /=>/,
    // Curly braces (code blocks)
    /^\s*[\{\}]\s*$/,
    // Semicolons at end of line
    /;\s*$/,
    // Code operators
    /[!=]==|&&|\|\||<<|>>|\+=|-=|\*=|\/=/,
    // Swift/Kotlin specific
    /@(IBOutlet|IBAction|Published|State|Binding|Observable|objc)\b/,
    // Type annotations
    /:\s*(Int|String|Bool|Float|Double|Array|Dictionary|Optional|List|Map|Set|View|some)\b/,
    // XML/HTML tags (when mixed with code)
    /<\/?[A-Z][A-Za-z]+[\s>]/,
    // Include / require / using
    /^#(include|import|define|pragma|if|endif)\b/,
    // Print/log statements
    /^(print|console\.log|NSLog|os_log|debugPrint|Logger)\s*\(/,
    // Comments
    /^\s*(\/\/|\/\*|\*\/|#\s|--\s)/,
    // Terminal/shell commands
    /^\$\s|^>\s|^\%\s/,
    // Pip/npm/cargo/pod commands
    /^(pip|npm|npx|cargo|pod|brew|apt|gem|yarn)\s+(install|add|run|init|build)/,
    // Common code formatting
    /^\s{4,}\S/,  // 4+ spaces indent
    /^\t+\S/,      // Tab indent
];

// Patterns for multi-line code blocks (text that looks like it's part of a code listing)
const STRONG_CODE_INDICATORS = [
    /^(import\s|from\s\S+\simport|#include|using\s|package\s)/,
    /^(func|fn|def|class|struct|enum|protocol|interface|extension|impl)\s/,
    /^(public|private|protected|internal|static|final|override|open)\s+(func|class|var|let|val|fun)/,
    /^\s*(if|else|for|while|switch|guard|do)\s*[\({]/,
    /\{\s*$/,  // Line ending with {
    /^\s*\}\s*$/,  // Line that's just }
    /\b(UIView|UIViewController|SwiftUI|ObservableObject|@main|@State|@Binding)\b/,
    /\b(tensorflow|tf\.|np\.|torch\.|cv2\.|model\.)\b/,
    /\b(GLfloat|GLint|GLenum|glBegin|glEnd|glVertex|shader|vertex|fragment)\b/,
    /\b(UObject|AActor|UActorComponent|UPROPERTY|UFUNCTION|BlueprintCallable)\b/,
];

interface CodeCandidate {
    blockIndex: number;
    text: string;
    confidence: 'high' | 'medium';
    matchedPatterns: string[];
}

function analyzeTextForCode(text: string): { isCode: boolean; confidence: 'high' | 'medium'; patterns: string[] } {
    if (!text || text.trim().length === 0) return { isCode: false, confidence: 'medium', patterns: [] };

    const matched: string[] = [];

    // Check strong indicators first
    for (const pattern of STRONG_CODE_INDICATORS) {
        if (pattern.test(text)) {
            matched.push(pattern.source.substring(0, 30));
        }
    }

    if (matched.length >= 1) {
        return { isCode: true, confidence: 'high', patterns: matched };
    }

    // Check regular code patterns
    for (const pattern of CODE_PATTERNS) {
        if (pattern.test(text)) {
            matched.push(pattern.source.substring(0, 30));
        }
    }

    // Need at least 2 pattern matches for medium confidence
    if (matched.length >= 2) {
        return { isCode: true, confidence: 'medium', patterns: matched };
    }

    return { isCode: false, confidence: 'medium', patterns: [] };
}

async function main() {
    const articles = await client.fetch(`*[_type == "collection.article" && _id match "migrated-*"]{
        _id,
        "title": metadata.title,
        body
    }`);

    console.log(`Scanning ${articles.length} articles for code content...\n`);

    let totalCandidates = 0;
    let articlesWithCode = 0;

    for (const article of articles) {
        if (!article.body) continue;

        const candidates: CodeCandidate[] = [];

        // Track consecutive code-like blocks for grouping
        let consecutiveCodeBlocks: number[] = [];

        for (let i = 0; i < article.body.length; i++) {
            const block = article.body[i];

            // Skip existing code blocks
            if (block._type === 'code') continue;

            // Only check text blocks
            if (block._type !== 'block') continue;
            if (!block.children) continue;

            const fullText = block.children
                .filter((c: any) => c._type === 'span')
                .map((c: any) => c.text || '')
                .join('');

            if (!fullText.trim()) continue;

            const analysis = analyzeTextForCode(fullText);
            if (analysis.isCode) {
                candidates.push({
                    blockIndex: i,
                    text: fullText.substring(0, 120),
                    confidence: analysis.confidence,
                    matchedPatterns: analysis.patterns,
                });
            }
        }

        if (candidates.length > 0) {
            articlesWithCode++;
            totalCandidates += candidates.length;
            console.log(`--- ${article.title} (${article._id}) ---`);
            console.log(`  Existing code blocks: ${article.body.filter((b: any) => b._type === 'code').length}`);
            for (const c of candidates) {
                const icon = c.confidence === 'high' ? '🔴' : '🟡';
                console.log(`  ${icon} body[${c.blockIndex}] [${c.confidence}]: "${c.text}"`);
            }
            console.log('');
        }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Articles scanned: ${articles.length}`);
    console.log(`Articles with code-like text: ${articlesWithCode}`);
    console.log(`Total code candidates: ${totalCandidates}`);
    console.log(`🔴 = high confidence, 🟡 = medium confidence`);
}

main().catch(console.error);

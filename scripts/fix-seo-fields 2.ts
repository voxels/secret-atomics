/**
 * fix-seo-fields.ts
 * 
 * Scans all articles and pages for missing SEO fields (title, description)
 * and generates keyword-optimized content for each.
 * 
 * Usage:
 *   npx tsx scripts/fix-seo-fields.ts          # dry-run
 *   npx tsx scripts/fix-seo-fields.ts --apply   # apply
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

function getText(block: any): string {
    if (!block?.children) return '';
    return block.children
        .filter((c: any) => c._type === 'span')
        .map((c: any) => c.text || '')
        .join('')
        .trim();
}

function getFirstParagraph(body: any[]): string {
    if (!body) return '';
    for (const block of body) {
        if (block._type === 'block' && block.style === 'normal') {
            const text = getText(block);
            if (text && text.length > 20) return text;
        }
    }
    return '';
}

// Carefully crafted SEO content for each article based on its actual content
const SEO_DATA: Record<string, { title: string; description: string }> = {
    'migrated-comparing-vr-rendering-models': {
        title: 'Comparing VR Rendering Models for Oculus Quest',
        description: 'A technical comparison of VR rendering approaches for Oculus Quest, covering forward vs deferred rendering, performance trade-offs, and optimization strategies for mobile VR development.',
    },
    'migrated-creating-a-metahuman-with-an-intel-realsense-depth-camera': {
        title: 'Creating a MetaHuman with Intel RealSense Depth Camera',
        description: 'Step-by-step guide to creating an Unreal Engine MetaHuman from a single depth camera image using Intel RealSense, Capturing Reality, and MeshLab for 3D scanning and reconstruction.',
    },
    'migrated-creating-a-youtube-vr-video-in-unreal': {
        title: 'Creating YouTube VR 360° Video in Unreal Engine',
        description: 'How to set up an Unreal Engine environment for rendering immersive YouTube VR content, including stereoscopic capture, scene composition, and high-fidelity VR video production.',
    },
    'migrated-delivering-interactive-graphics-wirelessly-to-an-led-matrix': {
        title: 'Wireless Interactive Graphics for LED Matrix Displays',
        description: 'Building a pipeline to drive LED matrix displays wirelessly from mobile devices using Fadecandy, SceneKit, and custom networking for real-time interactive light installations.',
    },
    'migrated-detecting-gestures-from-the-motion-of-the-body-in-relation-to-itself': {
        title: 'Gesture Detection Using Skeleton Joint Motion Analysis',
        description: 'Detecting gestures by measuring skeleton joint motion relative to the body using Intel depth cameras, Savitzky-Golay filtering, and Euler line geometry for signal recognition.',
    },
    'migrated-eliminating-collection-view-tearing-with-xcodes-time-profiler-instrument': {
        title: 'Fix UICollectionView Tearing with Xcode Time Profiler',
        description: 'Using Xcode Instruments Time Profiler to diagnose and fix UICollectionView cell tearing, optimize image loading, and move Parse callbacks off the main thread for smooth iOS scrolling.',
    },
    'migrated-experimenting-with-data-explorers': {
        title: 'Experimenting with Interactive Data Visualization Tools',
        description: 'Building interactive data explorers using Processing and d3.js to refine data collection questions, discover patterns, and create filterable dashboards for analytical inquiry.',
    },
    'migrated-exploring-data-visualization-on-the-vision-pro': {
        title: 'Data Visualization on Apple Vision Pro with RealityKit',
        description: 'Exploring immersive data visualization on Apple Vision Pro using ShaderGraph materials, RealityKit, and animated LED strip models for spatial computing data displays.',
    },
    'migrated-generating-interactive-particle-systems-in-opencv-and-spritekit': {
        title: 'Interactive Particle Systems with OpenCV and SpriteKit',
        description: 'Creating real-time particle systems by capturing infrared video from a custom camera, processing frames through OpenCV for keypoint detection, and rendering with SpriteKit.',
    },
    'migrated-iterating-the-design-of-a-volumetric-display': {
        title: 'Building a Cylindrical Volumetric LED Display from Scratch',
        description: 'Iterating through three versions of a DIY cylindrical volumetric display using LEDs, Teensy microcontrollers, servo motors, and slip rings for persistence-of-vision effects.',
    },
    'migrated-iterating-the-design-of-a-volumetric-display-retrospective-and-v4-plan': {
        title: 'Volumetric Display Retrospective: Three Design Iterations',
        description: 'A retrospective on three iterations of a Secret Atomics volumetric display — from basic LED strip on a drill rod to a mechanized Unreal Engine-driven spherical display.',
    },
    'migrated-know-maps-a-visionos-place-discovery-app': {
        title: 'Know Maps: VisionOS Place Discovery App with Foursquare',
        description: 'Building a VisionOS place discovery app using Foursquare API, SwiftUI, and spatial computing to search nearby venues by category with an immersive Apple Vision Pro interface.',
    },
    'migrated-know-maps-privacy-policy': {
        title: 'Know Maps Privacy Policy — Data Collection & Usage',
        description: 'Privacy policy for Know Maps VisionOS app detailing data collection practices, location data usage, Foursquare API integration, and user data protection measures.',
    },
    'migrated-measuring-and-visualizing-motion-of-the-body-relative-to-itself': {
        title: 'Measuring Body Motion with General Tau Theory & Depth Cameras',
        description: 'Applying General Tau Theory to measure and visualize body motion using depth cameras, skeleton tracking, and Unreal Engine for real-time motion perception analysis.',
    },
    'migrated-modeling-an-led-strip-in-visionos': {
        title: 'Modeling an Animated LED Strip in VisionOS with Blender',
        description: 'Testing the Blender to Reality Composer Pro to Xcode pipeline for VisionOS by modeling an LED strip with animated ShaderGraph material hue attributes.',
    },
    'migrated-new-years-eve-party': {
        title: 'NYE 2022 LED Installation & DJ Booth — Secret Atomics',
        description: 'Secret Atomics LED installation and SpriteKit projections for a New Years Eve 2022 party at Brooklyn Burj, featuring interactive lighting and DJ booth visuals.',
    },
    'migrated-prototyping-with-tensegrity': {
        title: 'Prototyping Tensegrity Structures for LED Displays',
        description: 'Exploring tensegrity structures as frameworks for LED displays, scaling from small models to large installations with Arduino-driven lighting and structural iteration.',
    },
    'migrated-rebuilding-a-vr-landscape': {
        title: 'Building a VR Landscape in Unreal Engine for Oculus Quest',
        description: 'A 17-step guide to creating a VR landscape environment in Unreal Engine using USGS elevation data, QGIS terrain processing, Quixel assets, and Oculus Quest deployment.',
    },
    'migrated-rendering-from-unreal-engine-5-to-led-panels-over-a-wireless-connection': {
        title: 'Streaming Unreal Engine 5 to LED Panels Wirelessly',
        description: 'Connecting Unreal Engine 5 to Raspberry Pi-driven LED panels over wireless using custom C++ scene capture components for real-time rendered LED wall output.',
    },
    'migrated-streaming-chatgpt-results-to-a-view-using-swifts-asyncsequence': {
        title: 'Streaming ChatGPT to iOS with Swift AsyncSequence',
        description: 'How to stream ChatGPT API responses to an iOS text view in real-time using URLSession bytes streaming and Swift AsyncSequence for progressive text rendering.',
    },
    'migrated-the-dilemma-of-using-chatgpt-in-the-interview-process': {
        title: 'Using ChatGPT in Technical Interviews: A Developer Dilemma',
        description: 'Reflecting on using ChatGPT in three software engineering interviews — the ethical considerations, practical benefits, and implications for the hiring process.',
    },
    'migrated-tips-in-implementing-tensorflow-lite-to-use-movenet-models-in-c': {
        title: 'TensorFlow Lite MoveNet in C++: Implementation Tips',
        description: 'Practical tips for implementing TensorFlow Lite with MoveNet pose estimation models in C++, covering build setup, interpreter configuration, and joint data extraction.',
    },
    'migrated-tips-on-tasks-from-chatgpt-4o': {
        title: 'Swift Concurrency Tips from ChatGPT 4o for VisionOS',
        description: 'Practical Swift concurrency patterns from ChatGPT 4o for VisionOS development, covering async/await task management, RealityKit subscriptions, and data streaming.',
    },
    'migrated-tula-house-privacy-policy': {
        title: 'Tula House Privacy Policy — App Data & Privacy',
        description: 'Privacy policy for the Tula House iOS application covering data collection, usage, storage practices, and user privacy protections in compliance with app store guidelines.',
    },
    'migrated-using-nuitrack-skeleton-tracking-to-drive-a-metahuman-skeleton': {
        title: 'Nuitrack Skeleton Tracking to Drive Unreal MetaHuman',
        description: 'Using the Nuitrack UE5 plugin to drive a MetaHuman skeleton in real-time with a depth camera for full-body motion capture and avatar animation in Unreal Engine.',
    },
    'migrated-working-across-platforms-and-teams-on-google-maps': {
        title: 'Working Across Platforms & Teams on Google Maps',
        description: 'Insights from working at Google on Maps across multiple platforms and teams, blending user journeys and cross-functional development to deliver cohesive mapping experiences.',
    },
};

async function main() {
    // Fetch all articles and pages
    const articles = await client.fetch(`*[_type == "collection.article"]{ _id, _type, "title": metadata.title, "slug": metadata.slug.current, seo, body }`);
    const pages = await client.fetch(`*[_type == "page"]{ _id, _type, "title": metadata.title, "slug": metadata.slug.current, seo }`);

    const allDocs = [...articles, ...pages];
    console.log(`Scanning ${articles.length} articles + ${pages.length} pages... Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}\n`);

    let totalFixed = 0;

    for (const doc of allDocs) {
        const missing: string[] = [];
        if (!doc.seo?.title) missing.push('title');
        if (!doc.seo?.description) missing.push('description');

        if (missing.length === 0) continue;

        const seoData = SEO_DATA[doc._id];
        const seo = doc.seo || {};
        const changes: string[] = [];

        if (missing.includes('title')) {
            if (seoData?.title) {
                seo.title = seoData.title;
                changes.push(`  + SEO Title (${seo.title.length} chars): "${seo.title}"`);
            } else {
                // Fallback: use document title truncated to 60 chars
                const fallback = (doc.title || '').substring(0, 60);
                if (fallback) {
                    seo.title = fallback;
                    changes.push(`  + SEO Title (fallback, ${seo.title.length} chars): "${seo.title}"`);
                }
            }
        }

        if (missing.includes('description')) {
            if (seoData?.description) {
                seo.description = seoData.description;
                changes.push(`  + SEO Description (${seo.description.length} chars): "${seo.description.substring(0, 80)}..."`);
            } else {
                // Fallback: use first paragraph
                const firstPara = getFirstParagraph(doc.body || []);
                if (firstPara) {
                    seo.description = firstPara.substring(0, 160);
                    changes.push(`  + SEO Description (fallback, ${seo.description.length} chars): "${seo.description.substring(0, 80)}..."`);
                }
            }
        }

        if (changes.length > 0) {
            console.log(`${doc._type} "${doc.title}" (${doc._id}):`);
            for (const c of changes) console.log(c);
            totalFixed++;

            if (!DRY_RUN) {
                await client.patch(doc._id).set({ seo }).commit();
                console.log(`  ✅ Patched.\n`);
            }
        }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`  Documents with SEO fixes: ${totalFixed}`);
    if (DRY_RUN) console.log(`  DRY RUN — run with --apply to make changes.`);
    console.log(`${'='.repeat(50)}`);
}

main().catch(console.error);

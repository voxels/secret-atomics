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

// Content-informed, keyword-optimized SEO descriptions crafted from reading each article
const SEO_DESCRIPTIONS: Record<string, string> = {
  // --- Migrated articles ---
  'migrated-comparing-vr-rendering-models':
    'Lessons from deploying Oculus Quest environments: forward vs deferred rendering, stereo instanced rendering, GPU profiling, and optimizing draw calls for mobile VR.',
  'migrated-creating-a-metahuman-with-an-intel-realsense-depth-camera':
    'How a single Intel RealSense depth image was turned into an Unreal Engine MetaHuman using Capturing Reality photogrammetry, MeshLab cleanup, and Blender retopology.',
  'migrated-creating-a-youtube-vr-video-in-unreal':
    'Setting up stereoscopic scene capture in Unreal Engine for rendering immersive YouTube VR 360° videos with high-fidelity lighting, materials, and spatial audio.',
  'migrated-delivering-interactive-graphics-wirelessly-to-an-led-matrix':
    'Optimizing a pipeline from iOS SceneKit framebuffer to Fadecandy-driven LED matrices over WiFi, covering OPC protocol, pixel mapping, and real-time color correction.',
  'migrated-detecting-gestures-from-the-motion-of-the-body-in-relation-to-itself':
    'Using depth cameras to track skeleton joints and detecting gestures through relative motion signals, Savitzky-Golay smoothing, and Euler line geometry analysis.',
  'migrated-eliminating-collection-view-tearing-with-xcodes-time-profiler-instrument':
    'Diagnosing UICollectionView cell image tearing with Xcode Time Profiler, moving Parse callbacks off the main thread, and achieving smooth 60fps iOS scrolling.',
  'migrated-experimenting-with-data-explorers':
    'Building interactive data visualization dashboards in Processing and d3.js to filter large datasets, refine collection questions, and surface patterns for inquiry.',
  'migrated-exploring-data-visualization-on-the-vision-pro':
    'Creating an immersive data visualization on Apple Vision Pro by modeling an LED strip in Blender, animating ShaderGraph materials in RealityKit, and driving hue via code.',
  'migrated-generating-interactive-particle-systems-in-opencv-and-spritekit':
    'Capturing infrared video from a homebrew camera, processing frames in OpenCV to extract keypoints, and rendering interactive particle effects with SpriteKit on iOS.',
  'migrated-iterating-the-design-of-a-volumetric-display':
    'Building a DIY cylindrical POV display across three iterations using Teensy, WS2812B LEDs, servo motors, slip rings, and hand-spun steel rods for volumetric effects.',
  'migrated-iterating-the-design-of-a-volumetric-display-retrospective-and-v4-plan':
    'Retrospective on three volumetric display builds — from LED strip on a drill to Unreal Engine-driven persistence-of-vision sphere — and plans for the next iteration.',
  'migrated-know-maps-a-visionos-place-discovery-app':
    'Know Maps is a VisionOS app using Foursquare API and ChatGPT to discover places by category, build taste profiles, and display results on an immersive spatial map.',
  'migrated-know-maps-privacy-policy':
    'Privacy policy for Know Maps: how the VisionOS app handles location data, Foursquare API requests, taste profile storage, and user data protection on Apple Vision Pro.',
  'migrated-measuring-and-visualizing-motion-of-the-body-relative-to-itself':
    'Applying General Tau Theory to depth-camera skeleton data — computing tau and tau-dot for joint triangles and visualizing motion perception in real-time in Unreal Engine.',
  'migrated-modeling-an-led-strip-in-visionos':
    'Walking through the Blender → Reality Composer Pro → Xcode pipeline for VisionOS: modeling an LED strip, creating custom ShaderGraph materials, and animating hue values.',
  'migrated-new-years-eve-party':
    'Producing lights and projections for NYE 2022 at Brooklyn Burj: Arduino-driven LED installations, SpriteKit projected visuals, and DJ booth graphics for three event areas.',
  'migrated-prototyping-with-tensegrity':
    'Scaling tensegrity structures from craft-store models to a 12-foot outdoor LED installation using PVC, bungee cord, plexi tubes, and Arduino-driven addressable LED strips.',
  'migrated-rebuilding-a-vr-landscape':
    '17 steps to build an Oculus Quest VR landscape: USGS heightmap import, QGIS processing, Quixel materials, hand tracking, teleportation, ocean, fog, and procedural foliage.',
  'migrated-rendering-from-unreal-engine-5-to-led-panels-over-a-wireless-connection':
    'Streaming Unreal Engine 5 scene capture to Raspberry Pi LED panels via WiFi using a custom C++ render buffer, nDisplay, and OPC protocol for real-time LED wall output.',
  'migrated-streaming-chatgpt-results-to-a-view-using-swifts-asyncsequence':
    'Streaming ChatGPT API responses token-by-token to an iOS SwiftUI text view using URLSession async bytes, JSONDecoder line parsing, and AsyncSequence for live updates.',
  'migrated-the-dilemma-of-using-chatgpt-in-the-interview-process':
    'Three real experiences using ChatGPT during software engineering interviews — preparing system design answers, generating code samples, and ethical considerations.',
  'migrated-tips-in-implementing-tensorflow-lite-to-use-movenet-models-in-c':
    'Setting up TensorFlow Lite in C++ for MoveNet pose estimation: CMake integration, model loading, interpreter configuration, and extracting 17 body joint coordinates.',
  'migrated-tips-on-tasks-from-chatgpt-4o':
    'Using ChatGPT 4o to optimize real-time VisionOS code: RealityKit scene event subscriptions, detached decode tasks, data compression, and multipeer connectivity streaming.',
  'migrated-tula-house-privacy-policy':
    'Privacy policy for Tula House Plant Visualizer iOS app: no personal data collected, anonymous usage analytics only, no third-party data sharing, and contact information.',
  'migrated-using-nuitrack-skeleton-tracking-to-drive-a-metahuman-skeleton':
    'Connecting the Nuitrack UE5 plugin to an Intel RealSense camera, remapping joint names, and correcting A-pose vs T-pose offsets to animate a MetaHuman in real-time.',
  'migrated-working-across-platforms-and-teams-on-google-maps':
    'Five years building 35 end-to-end prototypes at Google Maps: Assistant geo answers, AR exploration, Area Busyness, Immersive View concepts, and Bard integration demos.',
  // --- Non-migrated articles ---
  '0b703077-7fe6-4caa-9551-878ecd4afe82': // Google Maps + Assistant
    'UX Engineering at Google Maps and Google Assistant (2018–2023): prototyping AR navigation, Area Busyness, Immersive View, and cross-platform user journey demos.',
  '77cb6260-0e0a-47db-af3d-b0cb7b0cfbb6': // Secret Atomics + Snap
    'Secret Atomics creative technology collaboration with Snap Inc. — interactive installations, AR experiences, and physical computing projects in New York City.',
  '87f21a60-0092-4571-b6dd-e2c54541a52b': // iOS Product Engineer
    'Senior iOS Engineer at Homer Learning shipping educational features with UIKit and CoreAnimation, plus client app development at Noise Derived, Samsung, and more.',
  // --- Pages ---
  'e84aef15-07de-4d1c-bf4c-0898039dcf7e': // About
    'About Michael Edgcumbe and Secret Atomics — 13+ years of iOS product engineering, spatial computing, creative technology, and interactive physical installations.',
  'd288f366-015d-44e6-8e48-dae9e4022965': // Past Work
    'Portfolio: VR environments, VisionOS apps, LED installations, computer vision research, volumetric displays, and five years of UX prototyping at Google Maps.',
};

async function main() {
  const docs = await client.fetch(
    `*[_type in ["collection.article", "page"]]{ _id, "title": coalesce(metadata.title, title), seo }`
  );
  console.log(
    `Updating SEO descriptions for ${Object.keys(SEO_DESCRIPTIONS).length} documents... Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}\n`
  );

  let updated = 0;
  let skipped = 0;

  for (const doc of docs) {
    const newDesc = SEO_DESCRIPTIONS[doc._id];
    if (!newDesc) continue;

    const currentDesc = doc.seo?.description || '';
    if (currentDesc === newDesc) {
      skipped++;
      continue;
    }

    console.log(`✏️  ${doc.title}`);
    console.log(
      `   Old (${currentDesc.length} chars): "${currentDesc.substring(0, 60)}${currentDesc.length > 60 ? '...' : ''}"`
    );
    console.log(`   New (${newDesc.length} chars): "${newDesc.substring(0, 80)}..."`);

    if (!DRY_RUN) {
      await client.patch(doc._id).set({ 'seo.description': newDesc }).commit();
    }
    updated++;
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (already set): ${skipped}`);
  if (DRY_RUN) console.log(`  DRY RUN — run with --apply to make changes.`);
  console.log(`${'='.repeat(50)}`);
}

main().catch(console.error);

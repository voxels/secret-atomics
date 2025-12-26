import { MockContext } from '@dolores/mock-harness';
import { SignalIntegrity } from '@dolores/signal-integrity';
import { DebugOverlay, GoldGate } from '@dolores/ui-templates';

/**
 * Sample Experiment: "Gold Gate" simulation
 */
async function runSampleExperiment() {
    console.log('--- Starting Project Dolores Sample Experiment ---');

    // 1. Initialize Mock Context (God Mode)
    const context = new MockContext({ userId: 't2_researcher', subredditId: 't5_experiment' });

    // 2. Initialize Signal Integrity Layer
    const si = new SignalIntegrity();

    // 3. Simulate stateful interaction
    const [count, setCount] = context.useState(0);
    console.log('Initial state count:', count);
    setCount(1);

    // 4. Capture "Dark Signals"
    si.capture('page_view', 't2_user1', { dwell_time: 4500 });
    si.capture('click', 't2_user1', { element: 'gold_purchase_btn' });

    // Simulate rage clicks
    si.capture('click', 't2_user2');
    si.capture('click', 't2_user2');
    si.capture('click', 't2_user2');
    si.capture('rage_click', 't2_user2');

    // 5. Visualize via Debug Overlay logic (Mocked DOM)
    console.log('--- Debug Overlay State ---');
    const events = si.getEvents();
    console.log('Total Events Captured:', events.length);
    console.log('Theta Sketch Unique Estimate:', si.simulateThetaSketch(events.map((e: any) => e.user_id)).estimate);

    // 6. Test Redis Mock
    await context.redis.set('exp_flag', 'enabled');
    const flag = await context.redis.get('exp_flag');
    console.log('Redis key "exp_flag":', flag);

    // 7. Test Economy Simulator
    console.log('--- Economy Simulation ---');
    const products = await context.reddit.getProducts();
    console.log('Available Products:', products.map((p: any) => `${p.name} (${p.stock} left)`));

    const purchaseResult = await context.reddit.pay({ productId: 'custom_avatar_rare' });
    console.log('Purchase Result (Rare Avatar):', purchaseResult.status);

    // Force scarcity
    console.log('Simulating scarcity...');
    for (let i = 0; i < 5; i++) {
        await context.reddit.pay({ productId: 'custom_avatar_rare' });
    }
    const failedPurchase = await context.reddit.pay({ productId: 'custom_avatar_rare' });
    console.log('Post-Scarcity Purchase Result:', failedPurchase.status, failedPurchase.reason);

    // 8. Demonstrate Gold Gate Template
    console.log('--- Gold Gate Simulation ---');
    const goldGate = new GoldGate(context, si);
    // In a browser, this would append to DOM. Here we just trigger the logic.
    console.log('Current Experiment Bucket:', context.getBucket());

    // 9. Enhanced Debug Overlay
    console.log('--- Debug Overlay (Enhanced) ---');
    const overlay = new DebugOverlay(si, context);
    // overlay.mount(); // Would mount in browser
    overlay.render(); // Force a render to log state

    // 10. Test Real-time Mock
    console.log('--- Real-time Simulation ---');
    context.realtime.subscribe('test_channel', (data: any) => {
        console.log('[SampleApp] Received realtime event:', data);
    });
    context.realtime.publish('test_channel', { msg: 'Hello from Project Dolores' });

    console.log('--- Experiment Logic Verified ---');
}

runSampleExperiment().catch(console.error);

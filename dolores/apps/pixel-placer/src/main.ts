// Browser-side Entry Point
import './polyfills';

interface Window {
    lastClickTimes: number[];
}

if (typeof document !== 'undefined') {
    const status = document.getElementById('status-bar');
    if (status) status.innerText = 'Initializing scripts...';

    window.onerror = (msg, url, lineNo, columnNo, error) => {
        if (status) {
            status.innerText = `CRITICAL ERROR: ${msg}\nLine: ${lineNo}`;
            status.style.color = 'red';
        }
        return false;
    };
}

import { MockContext } from '@dolores/mock-harness';
import { SignalIntegrity } from '@dolores/signal-integrity';
import { DebugOverlay, GoldGate, ConfigMenu } from '@dolores/ui-templates';
import { PixelBoard } from './PixelBoard';

const initApp = async () => {
    const status = document.getElementById('status-bar');
    const updateStatus = (msg: string) => {
        console.log(msg);
        if (status) status.innerText = msg;
    };

    updateStatus('Step 1: Imports loaded. Initializing Context...');

    // Add small delay to let UI render between steps (debugging)
    await new Promise(r => setTimeout(r, 100));

    const context = new MockContext({
        userId: 't2_browser_user',
        bucketId: 'treatment'
    });

    updateStatus('Step 2: Context ready. Initializing SignalIntegrity...');
    await new Promise(r => setTimeout(r, 100));

    const si = new SignalIntegrity();
    // Attach session tracker to window
    new (await import('@dolores/signal-integrity')).SessionTracker(si, 't2_browser_user');

    updateStatus('Step 3: App components initializing...');
    await new Promise(r => setTimeout(r, 100));

    const board = new PixelBoard(context);
    const overlay = new DebugOverlay(si, context);
    const configMenu = new ConfigMenu(context.config);

    updateStatus('Step 4: Rendering UI...');

    // Render Config Menu
    const menuContainer = document.getElementById('config-menu-container');
    if (menuContainer) {
        menuContainer.innerHTML = '<h3>Vibe Coding Menu</h3>' + configMenu.renderData(context.config);
    }

    // Render Debug Overlay
    overlay.mount();
    // Start Rendering loop for overlay
    setInterval(() => overlay.render(), 1000);

    // Setup Board UI
    const gameContainer = document.getElementById('game-container');
    const statusBar = document.getElementById('status-bar');

    if (!gameContainer) return;

    // Initialize Grid
    const width = 10;
    const height = 10;
    gameContainer.style.gridTemplateColumns = `repeat(${width}, 1fr)`;

    const renderBoard = async () => {
        const currentBoard = await board.getBoard();
        gameContainer.innerHTML = '';

        currentBoard.forEach((row, y) => {
            row.forEach((color, x) => {
                const pixel = document.createElement('div');
                pixel.className = 'pixel';
                pixel.style.backgroundColor = color;
                pixel.title = `(${x}, ${y})`;

                pixel.onclick = async () => {
                    try {
                        // Apply visual animation config
                        const animDuration = context.config.Visuals?.Animations?.placePixelDuration || 300;
                        pixel.style.transition = `transform ${animDuration}ms`;
                        pixel.style.transform = 'scale(0.5)';

                        await board.setPixel(x, y, context.config.Visuals?.Colors?.primary || '#FF4500'); // Use config color
                        si.capture('pixel_place', 't2_browser_user', { x, y });

                        // --- RAGE CLICK DETECTION LOGIC ---
                        const now = Date.now();
                        if (!window.lastClickTimes) window.lastClickTimes = [];
                        window.lastClickTimes.push(now);

                        // Keep only last 2 seconds
                        window.lastClickTimes = window.lastClickTimes.filter(t => now - t < 1000);

                        if (window.lastClickTimes.length >= 5) {
                            console.warn('[Rage Click] Detected!');
                            si.capture('rage_click', 't2_browser_user', { x, y, count: window.lastClickTimes.length });
                            // Optional: Shake the screen or show feedback
                            gameContainer.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
                            setTimeout(() => gameContainer.style.transform = 'none', 100);
                            // Reset to avoid spamming
                            window.lastClickTimes = [];
                        }
                        // ----------------------------------

                        setTimeout(() => pixel.style.transform = 'scale(1)', 100);
                    } catch (e) {
                        console.error(e);
                    }
                };

                // Dead Click Detection Test (Right click or weird drags)
                // Note: The DeadClickDetector is global, so clicking the background works too.

                gameContainer.appendChild(pixel);
            });
        });
    };

    // Listen for Realtime Updates
    context.realtime.connect().subscribe('board_update', (data: any) => {
        console.log('[Realtime] Board updated', data);
        // Optimistic update or full re-render
        renderBoard();
    });

    // Initial Render
    await renderBoard();
    if (statusBar) statusBar.innerText = "Connected. Place a pixel!";

    // Economy Test Button
    const buyBtn = document.createElement('button');
    buyBtn.innerText = "Buy Premium Palette";
    buyBtn.style.marginTop = "20px";
    buyBtn.style.padding = "10px 20px";
    buyBtn.onclick = async () => {
        const goldGate = new GoldGate(context, si, 'custom_avatar_rare');
        goldGate.render();
    };
    document.body.appendChild(buyBtn);
};

initApp().catch(e => {
    console.error(e);
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        statusBar.innerText = `Error: ${e.message}`;
        statusBar.style.color = 'red';
    }
});

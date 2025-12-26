// Browser-side Entry Point
import './polyfills';

interface Window {
    lastClickTimes: number[];
}

import { MockContext } from '@dolores/mock-harness';
import { SignalIntegrity } from '@dolores/signal-integrity';
import { DebugOverlay, GoldGate, ConfigMenu } from '@dolores/ui-templates';
import { PixelBoard } from './PixelBoard';

// Integrations
import { QualitativeStudy } from './QualitativeStudy';
import { ModeratorDashboard } from './ModeratorDashboard';
import { RoleSelector } from './RoleSelector';
import { LiveMonitor } from './LiveMonitor';

const initApp = async () => {
    // Phase 0: Role Selection (Blocking)
    const role = await RoleSelector.selectRole();
    console.log(`Starting in role: ${role}`);

    const status = document.getElementById('status-bar');
    const updateStatus = (msg: string) => {
        console.log(msg);
        if (status) status.innerText = msg;
    };

    updateStatus('Initializing Context...');

    const context = new MockContext({
        userId: 't2_browser_user',
        bucketId: 'treatment'
    });

    const si = new SignalIntegrity();
    new (await import('@dolores/signal-integrity')).SessionTracker(si, 't2_browser_user');

    // Shared State
    let hasStudyPass = false;
    let pixelsPlacedCount = 0;
    let activeColor = context.config.Visuals?.Colors?.primary || '#FF4500';
    const qualitativeStudy = new QualitativeStudy(context);

    const renderFullUI = (
        board: PixelBoard,
        overlay: DebugOverlay,
        configMenu: ConfigMenu,
        si: SignalIntegrity,
        context: MockContext
    ) => {
        const isParticipant = role === 'participant';

        // 1. Render Palette/Config Menu
        const menuContainer = document.getElementById('config-menu-container');
        if (menuContainer) {
            menuContainer.style.display = 'block';
            menuContainer.innerHTML = ''; // Clear previous

            if (isParticipant) {
                const header = document.createElement('h3');
                header.innerText = hasStudyPass ? '🎨 Study Palette (Premium)' : '🎨 Study Palette (Limited)';
                menuContainer.appendChild(header);

                const swatchContainer = document.createElement('div');
                Object.assign(swatchContainer.style, {
                    display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px'
                });

                const allColors = { ...context.config.Visuals?.Colors };
                const colorsToRender = hasStudyPass ? Object.entries(allColors) :
                    Object.entries(allColors).filter(([k]) => ['primary', 'secondary', 'canvasBackground'].includes(k));

                colorsToRender.forEach(([name, hex]) => {
                    const swatch = document.createElement('div');
                    Object.assign(swatch.style, {
                        width: '30px', height: '30px', backgroundColor: hex as string,
                        borderRadius: '50%', cursor: 'pointer', border: activeColor === hex ? '3px solid white' : '1px solid #555',
                        boxShadow: activeColor === hex ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                    });
                    swatch.title = name;
                    swatch.onclick = () => {
                        activeColor = hex as string;
                        renderFullUI(board, overlay, configMenu, si, context); // Re-render to update highlights
                    };
                    swatchContainer.appendChild(swatch);
                });
                menuContainer.appendChild(swatchContainer);
            } else {
                menuContainer.innerHTML = '<h3>🕵️ Designer Menu</h3>' + configMenu.renderData(context.config);
            }
        }

        // 2. Render Debug Overlay
        if (!isParticipant) {
            overlay.mount();
        }

        // 3. Render Game Board
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;

        gameContainer.style.gridTemplateColumns = `repeat(10, 1fr)`;

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
                            // Toggling Logic: If same color or have pass, toggle off
                            if (color !== '#ffffff' && color === activeColor) {
                                await board.clearPixel(x, y);
                            } else {
                                const animDuration = context.config.Visuals?.Animations?.placePixelDuration || 300;
                                pixel.style.transition = `transform ${animDuration}ms`;
                                pixel.style.transform = 'scale(0.5)';

                                await board.setPixel(x, y, activeColor);

                                // Broadcast to Moderator
                                context.realtime.connect().send('moderator_event', {
                                    type: 'pixel_placed',
                                    x, y,
                                    timestamp: Date.now()
                                });

                                pixelsPlacedCount++;
                                if (pixelsPlacedCount === 3) showSurveyButton();
                            }

                            // Rage Click Detection
                            const now = Date.now();
                            if (!(window as any).lastClickTimes) (window as any).lastClickTimes = [];
                            (window as any).lastClickTimes.push(now);
                            (window as any).lastClickTimes = (window as any).lastClickTimes.filter((t: number) => now - t < 1000);

                            if ((window as any).lastClickTimes.length >= 5) {
                                (window as any).lastClickTimes = [];
                                const gemini = (await import('./GeminiModerator')).GeminiModerator.getInstance();
                                const question = await gemini.generateRageClickIntervention();
                                qualitativeStudy.triggerIntervention(question);

                                context.realtime.connect().send('moderator_event', {
                                    type: 'rage_click',
                                    timestamp: Date.now()
                                });
                            }

                            setTimeout(() => pixel.style.transform = 'scale(1)', 100);
                        } catch (e) {
                            console.error(e);
                        }
                    };
                    gameContainer.appendChild(pixel);
                });
            });
        };

        const showSurveyButton = () => {
            if (document.getElementById('survey-btn')) return;
            const surveyBtn = document.createElement('button');
            surveyBtn.id = 'survey-btn';
            surveyBtn.innerText = "📋 Take Research Survey";
            Object.assign(surveyBtn.style, {
                display: 'block', padding: '10px 20px', backgroundColor: '#009688', color: 'white',
                border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px'
            });
            surveyBtn.onclick = () => qualitativeStudy.start();
            document.body.appendChild(surveyBtn);
        };

        const realtime = context.realtime.connect();
        realtime.subscribe('board_update', () => renderBoard());
        renderBoard();

        // 4. Participant Controls
        if (isParticipant && !document.getElementById('buy-btn')) {
            const buyBtn = document.createElement('button');
            buyBtn.id = 'buy-btn';
            buyBtn.innerText = "💎 Buy Study Pass";
            buyBtn.style.padding = "10px 20px";
            buyBtn.style.marginTop = "20px";
            buyBtn.onclick = async () => {
                const goldGate = new GoldGate(context, si, 'custom_avatar_rare');
                goldGate.render();
                setTimeout(() => {
                    hasStudyPass = true;
                    buyBtn.innerText = "✅ Premium Unlocked";
                    buyBtn.disabled = true;
                    // Re-render palette
                    renderFullUI(board, overlay, configMenu, si, context);
                }, 1500);
            };
            document.body.appendChild(buyBtn);
        }
    };

    if (role === 'designer') {
        const board = new PixelBoard(context);
        const overlay = new DebugOverlay(si, context);
        const configMenu = new ConfigMenu(context.config);
        const moderatorDashboard = new ModeratorDashboard(qualitativeStudy);
        moderatorDashboard.open();
        renderFullUI(board, overlay, configMenu, si, context);
        return;
    }

    if (role === 'moderator') {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) gameContainer.style.display = 'none';
        const h1 = document.querySelector('h1');
        if (h1) h1.style.display = 'none';
        const st = document.getElementById('status-bar');
        if (st) st.style.display = 'none';
        const configMenuContainer = document.getElementById('config-menu-container');
        if (configMenuContainer) configMenuContainer.style.display = 'none';

        new LiveMonitor(context);
        return;
    }

    // Default: Participant
    const board = new PixelBoard(context);
    const overlay = new DebugOverlay(si, context);
    const configMenu = new ConfigMenu(context.config);
    renderFullUI(board, overlay, configMenu, si, context);
};

initApp().catch(e => {
    console.error(e);
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        statusBar.innerText = `Error: ${e.message}`;
        statusBar.style.color = 'red';
    }
});

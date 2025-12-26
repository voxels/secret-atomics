import { SignalIntegrity, TelemetryEvent } from '@dolores/signal-integrity';

/**
 * Debug Overlay Prototype
 * Visualizes "Dark Signals" and experiment state.
 */
export class DebugOverlay {
  private container: HTMLElement | null = null;
  private signalIntegrity: SignalIntegrity;
  private mockContext: any;

  constructor(signalIntegrity: SignalIntegrity, mockContext: any) {
    this.signalIntegrity = signalIntegrity;
    this.mockContext = mockContext;
  }

  mount(parent: HTMLElement = document.body) {
    this.container = document.createElement('div');
    this.container.id = 'dolores-debug-overlay';
    this.applyStyles();
    parent.appendChild(this.container);
    this.render();

    // Auto-refresh every second
    setInterval(() => this.render(), 1000);
  }

  private applyStyles() {
    if (!this.container) return;
    Object.assign(this.container.style, {
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '300px',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      color: '#00ff00',
      fontFamily: 'monospace',
      padding: '10px',
      borderRadius: '8px',
      zIndex: '10000',
      fontSize: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      maxHeight: '80vh',
      overflowY: 'auto'
    });
  }

  render() {
    if (typeof document === 'undefined') {
      console.log('[DebugOverlay] Virtual Render: Metrics Updated');
      return;
    }
    if (!this.container) return;
    const events = this.signalIntegrity.getEvents();
    const rageClickCount = events.filter((e: any) => e.event_type === 'rage_click').length;

    this.container.innerHTML = `
      <div style="border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 10px; font-weight: bold;">
        PROJECT DOLORES DEBUG
      </div>
      <div>
        <strong>Recent Signals:</strong>
        <ul style="list-style: none; padding: 0; margin-top: 5px;">
          ${events.slice(-5).reverse().map((e: any) => `
            <li style="margin-bottom: 4px; border-left: 2px solid #00aa00; padding-left: 5px;">
              [${new Date(e.timestamp).toLocaleTimeString()}] ${e.event_type}
            </li>
          `).join('')}
        </ul>
      </div>
      <div style="margin-top: 10px; padding-top: 5px; border-top: 1px solid #333;">
        <strong>Metrics:</strong><br/>
        Rage Clicks: <span style="color: ${rageClickCount > 0 ? '#ff4444' : '#00ff00'}">${rageClickCount}</span><br/>
        Est. Unique Users: ${this.signalIntegrity.simulateThetaSketch(events.map((e: any) => e.user_id)).estimate}<br/>
        <strong>Bucket:</strong> <span style="color: #00ffff">${this.mockContext.getBucket()}</span>
      </div>
    `;
  }
}

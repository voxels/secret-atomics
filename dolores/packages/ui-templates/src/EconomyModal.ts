/**
 * Economy Modal Prototype
 * Simulates the reddit.pay() post-purchase UX path.
 */
export class EconomyModal {
    private container: HTMLElement | null = null;

    constructor() { }

    show(productName: string, success: boolean, reason?: string) {
        this.container = document.createElement('div');
        this.container.id = 'dolores-economy-modal';
        this.applyStyles();

        this.container.innerHTML = `
      <div style="background: white; color: black; padding: 20px; border-radius: 12px; width: 300px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <h2 style="margin-top: 0; color: ${success ? '#00aa00' : '#ff4444'}">
          ${success ? 'Purchase Success!' : 'Purchase Failed'}
        </h2>
        <p style="font-size: 14px; margin: 15px 0;">
          ${success
                ? `Successfully purchased <strong>${productName}</strong>. Item added to inventory.`
                : `Could not complete purchase of ${productName}${reason ? `: ${reason}` : ''}.`}
        </p>
        <button id="dolores-modal-close" style="background: #0079d3; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-weight: bold;">
          Close
        </button>
      </div>
    `;

        document.body.appendChild(this.container);

        document.getElementById('dolores-modal-close')?.addEventListener('click', () => {
            this.close();
        });
    }

    private applyStyles() {
        if (!this.container) return;
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '20000',
            fontFamily: 'sans-serif'
        });
    }

    close() {
        if (this.container) {
            document.body.removeChild(this.container);
            this.container = null;
        }
    }
}

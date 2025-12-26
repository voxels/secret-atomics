import { MockContext } from '@dolores/mock-harness';
import { SignalIntegrity } from '@dolores/signal-integrity';

/**
 * Gold Gate Template
 * Opinionated template for testing price sensitivity.
 */
export class GoldGate {
  private context: MockContext;
  private si: SignalIntegrity;
  private productId: string;
  private container: HTMLElement | null = null;

  constructor(context: MockContext, si: SignalIntegrity, productId: string = 'gold_100') {
    this.context = context;
    this.si = si;
    this.productId = productId;
  }

  async render(parent: any = null) {
    if (typeof document === 'undefined') {
      console.log(`[GoldGate] Virtual Render: Discovered Product ${this.productId}`);
      return;
    }

    const targetParent = parent || document.body;
    const bucket = this.context.getBucket();
    const products = await this.context.reddit.getProducts();
    const product = products.find((p: any) => p.id === this.productId);

    if (!product) {
      console.error(`[GoldGate] Product ${this.productId} not found`);
      return;
    }

    // Treatment group sees a 20% discount
    const displayPrice = bucket === 'treatment' ? Math.floor(product.price_gold * 0.8) : product.price_gold;

    this.container = document.createElement('div');
    this.container.id = 'gold-gate-container';
    this.applyStyles();

    this.container.innerHTML = `
      <div style="background: #1a1a1b; color: #d7dadc; padding: 20px; border-radius: 8px; border: 1px solid #343536; text-align: center; width: 350px;">
        <h3 style="margin-top: 0; color: #ffd700;">Exclusive Offer</h3>
        <p style="font-size: 14px;">Get <strong>${product.name}</strong> to unlock premium features.</p>
        <div style="margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: ${bucket === 'treatment' ? '#44ff44' : '#ffffff'}">
            ${displayPrice} Gold
          </span>
          ${bucket === 'treatment' ? `<br/><small style="text-decoration: line-through; opacity: 0.6;">${product.price_gold} Gold</small>` : ''}
        </div>
        <button id="gold-gate-buy-btn" style="background: #ff4500; color: white; border: none; padding: 12px 24px; border-radius: 999px; cursor: pointer; font-weight: bold; width: 100%;">
          Purchase Now
        </button>
        <p style="font-size: 10px; margin-top: 10px; opacity: 0.5;">Experiment Bucket: ${bucket}</p>
      </div>
    `;
    targetParent.appendChild(this.container);

    document.getElementById('gold-gate-buy-btn')?.addEventListener('click', async () => {
      this.si.capture('gold_gate_click', 'user_id', { bucket, price: displayPrice });
      const result = await this.context.reddit.pay({ productId: this.productId });

      if (result.status === 'success') {
        this.si.capture('gold_gate_purchase_success', 'user_id', { bucket });
        alert('Purchase successful!');
      } else {
        this.si.capture('gold_gate_purchase_failed', 'user_id', { bucket, reason: result.reason });
        alert(`Purchase failed: ${result.reason}`);
      }
    });

    this.si.capture('gold_gate_impression', 'user_id', { bucket, price: displayPrice });
  }

  private applyStyles() {
    if (!this.container) return;
    Object.assign(this.container.style, {
      position: 'fixed',
      bottom: '100px',
      right: '20px',
      zIndex: '9999',
      fontFamily: 'sans-serif'
    });
  }
}

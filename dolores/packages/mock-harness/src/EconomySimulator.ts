/**
 * Economy Simulator
 * Manages virtual products, pricing, and scarcity logic.
 */

export interface Product {
    id: string;
    name: string;
    price_gold: number;
    stock: number;
    sold_out: boolean;
}

export class EconomySimulator {
    private products: Map<string, Product> = new Map();

    constructor(initialProducts: Product[] = []) {
        initialProducts.forEach(p => this.products.set(p.id, p));
    }

    getProducts(): Product[] {
        return Array.from(this.products.values());
    }

    getProduct(id: string): Product | undefined {
        return this.products.get(id);
    }

    /**
     * Simulates a purchase attempt.
     */
    purchase(id: string): { success: boolean, reason?: string } {
        const product = this.products.get(id);
        if (!product) return { success: false, reason: 'Product not found' };
        if (product.sold_out || product.stock <= 0) return { success: false, reason: 'Sold out' };

        product.stock -= 1;
        if (product.stock === 0) product.sold_out = true;
        return { success: true };
    }

    updateStock(id: string, stock: number) {
        const product = this.products.get(id);
        if (product) {
            product.stock = stock;
            product.sold_out = stock <= 0;
        }
    }
}

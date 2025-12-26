/**
 * Pixel Placer Game Logic
 * Simulates a r/place style canvas backed by Redis.
 */
import { MockContext } from '@dolores/mock-harness';

export class PixelBoard {
    private context: MockContext;
    private width: number = 10;
    private height: number = 10;

    constructor(context: MockContext) {
        this.context = context;
    }

    async setPixel(x: number, y: number, color: string) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            throw new Error('Coordinates out of bounds');
        }

        const key = `pixel:${x}:${y}`;
        await this.context.redis.set(key, color);

        // Broadcast update to all connected clients (Realtime Mock)
        this.context.realtime.send('board_update', { x, y, color });
        console.log(`[PixelBoard] Set pixel (${x}, ${y}) to ${color}`);
    }

    async clearPixel(x: number, y: number) {
        await this.setPixel(x, y, '#ffffff');
    }

    async getBoard(): Promise<string[][]> {
        const board = Array(this.height).fill(null).map(() => Array(this.width).fill('#ffffff'));

        // In a real app we'd use hGetAll or a bitfield. Mapped for simplicity here.
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const color = await this.context.redis.get(`pixel:${x}:${y}`);
                if (color) board[y][x] = color;
            }
        }
        return board;
    }
}

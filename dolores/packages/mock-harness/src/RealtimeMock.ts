import { EventEmitter } from 'events';

/**
 * Real-time Mock
 * Simulates synchronous engagement with < 100ms latency.
 */
export class RealtimeMock {
    private emitter: EventEmitter;
    private channelHandlers: Map<string, Set<(data: any) => void>> = new Map();

    constructor() {
        this.emitter = new EventEmitter();
    }

    /**
     * Simulates joining a real-time channel.
     */
    subscribe(channel: string, handler: (data: any) => void) {
        if (!this.channelHandlers.has(channel)) {
            this.channelHandlers.set(channel, new Set());
        }
        this.channelHandlers.get(channel)!.add(handler);
        this.emitter.on(channel, handler);
        console.log(`[RealtimeMock] Subscribed to ${channel}`);
    }

    /**
     * Simulates publishing an event to a channel.
     */
    publish(channel: string, data: any) {
        // Simulate network latency < 100ms
        const latency = Math.floor(Math.random() * 50);
        setTimeout(() => {
            this.emitter.emit(channel, data);
            console.log(`[RealtimeMock] Published to ${channel} with ${latency}ms latency`, data);
        }, latency);
    }

    unsubscribe(channel: string, handler: (data: any) => void) {
        const handlers = this.channelHandlers.get(channel);
        if (handlers) {
            handlers.delete(handler);
            this.emitter.off(channel, handler);
        }
    }

    // Aliases for Devvit SDK Parity
    send(channel: string, data: any) {
        return this.publish(channel, data);
    }

    connect() {
        console.log('[RealtimeMock] Connected (Simulated)');
        return this;
    }
}

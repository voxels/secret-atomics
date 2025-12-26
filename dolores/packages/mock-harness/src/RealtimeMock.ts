import { EventEmitter } from 'events';

/**
 * Real-time Mock
 * Simulates synchronous engagement with < 100ms latency.
 */
export class RealtimeMock {
    private emitter: EventEmitter;
    private channelHandlers: Map<string, Set<(data: any) => void>> = new Map();
    private broadcastChannel: BroadcastChannel;

    constructor() {
        this.emitter = new EventEmitter();
        this.broadcastChannel = new BroadcastChannel('dolores_realtime');

        this.broadcastChannel.onmessage = (event) => {
            const { channel, data } = event.data;
            console.log(`[RealtimeMock] Received cross-tab event on ${channel}`, data);
            this.emitter.emit(channel, data);
        };
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
        // Broadcast to other tabs
        this.broadcastChannel.postMessage({ channel, data });

        // Simulate local network latency < 100ms
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

    // Aliases for Devvit/Socket.io parity
    emit(channel: string, data: any) {
        return this.publish(channel, data);
    }

    send(channel: string, data: any) {
        return this.publish(channel, data);
    }

    on(channel: string, handler: (data: any) => void) {
        return this.subscribe(channel, handler);
    }

    connect() {
        console.log('[RealtimeMock] Connected (Simulated)');
        return this;
    }
}

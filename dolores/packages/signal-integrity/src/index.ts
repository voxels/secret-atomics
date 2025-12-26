/**
 * Signal Integrity Layer
 * Responsible for capturing dark signals and validating telemetry.
 */
export * from './DeadClickDetector';
export * from './SessionTracker';

export interface TelemetryEvent {
    event_type: string;
    user_id: string;
    timestamp: number;
    payload: Record<string, any>;
}

export class SignalIntegrity {
    private events: TelemetryEvent[] = [];

    /**
     * Captures a "dark signal" event.
     */
    capture(type: string, userId: string, payload: Record<string, any> = {}) {
        const event: TelemetryEvent = {
            event_type: type,
            user_id: userId,
            timestamp: Date.now(),
            payload
        };
        this.events.push(event);
        console.log(`[SignalIntegrity] Captured ${type} for ${userId}`, payload);
        return event;
    }

    /**
     * Simulates a "Rage Click" detection logic.
     */
    detectRageClicks(clickTimestamps: number[], threshold: number = 3, intervalMs: number = 1000): boolean {
        if (clickTimestamps.length < threshold) return false;
        const recentClicks = clickTimestamps.filter(t => Date.now() - t < intervalMs);
        return recentClicks.length >= threshold;
    }

    /**
   * Simulates Theta Sketch aggregation for approximate unique counts.
   * In a real Druid environment, this would be a sophisticated sketch.
   * Here we mock it by collecting unique IDs and applying a "trust factor".
   */
    simulateThetaSketch(userIds: string[]): { estimate: number, lowerBound: number, upperBound: number } {
        const uniqueUsers = new Set(userIds);
        const count = uniqueUsers.size;
        // Simulate the error margin of a real sketch
        return {
            estimate: count,
            lowerBound: Math.floor(count * 0.98),
            upperBound: Math.ceil(count * 1.02)
        };
    }

    /**
     * Exports events for "Druid" simulation.
     */
    getEvents(): TelemetryEvent[] {
        return [...this.events];
    }

    clear() {
        this.events = [];
    }
}

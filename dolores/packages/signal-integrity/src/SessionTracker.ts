import { SignalIntegrity } from './index';

/**
 * Tracks "Session Dwell Time" using the Page Visibility API.
 * Captures accurate "Time on Site" by detecting tab switches.
 */
export class SessionTracker {
    private si: SignalIntegrity;
    private userId: string;
    private startTime: number;
    private totalActiveTime: number = 0;
    private lastVisibleStart: number;

    constructor(si: SignalIntegrity, userId: string = 'anon') {
        this.si = si;
        this.userId = userId;
        this.startTime = Date.now();
        this.lastVisibleStart = Date.now();

        if (typeof document !== 'undefined') {
            this.attach();
        }
    }

    private attach() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Tab hidden: calculate duration since last visible
                const duration = Date.now() - this.lastVisibleStart;
                this.totalActiveTime += duration;

                this.si.capture('session_visibility_hidden', this.userId, {
                    active_segment_ms: duration,
                    total_active_ms: this.totalActiveTime
                });
            } else {
                // Tab visible again
                this.lastVisibleStart = Date.now();
                this.si.capture('session_visibility_visible', this.userId, {});
            }
        });

        // Capture on unload
        window.addEventListener('beforeunload', () => {
            const duration = Date.now() - this.lastVisibleStart;
            if (!document.hidden) {
                this.totalActiveTime += duration;
            }
            this.si.capture('session_end', this.userId, {
                total_duration_ms: Date.now() - this.startTime,
                total_active_ms: this.totalActiveTime
            });
        });
    }
}

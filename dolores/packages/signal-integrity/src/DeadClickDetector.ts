import { SignalIntegrity } from './index';

/**
 * Detects "Dead Clicks" - clicks on non-interactive elements.
 * A dead click is defined as a click on an element that is NOT:
 * - A link (a[href])
 * - A button
 * - An input/textarea/select
 * - An element with an onclick handler (hard to detect reliably in all frameworks, but we can check standard properties)
 * - An element with 'cursor: pointer' (computed style)
 */
export class DeadClickDetector {
    private si: SignalIntegrity;
    private userId: string;

    constructor(si: SignalIntegrity, userId: string = 'anon') {
        this.si = si;
        this.userId = userId;
    }

    attach(target: HTMLElement | Document = document) {
        if (typeof document === 'undefined') return; // Guard for Node env

        target.addEventListener('click', (event: Event) => {
            const e = event as MouseEvent;
            const target = e.target as HTMLElement;

            if (this.isInteractive(target)) {
                return; // Valid click
            }

            // Check parents just in case (bubbling)
            let current: HTMLElement | null = target;
            while (current && current !== document.body) {
                if (this.isInteractive(current)) return;
                current = current.parentElement;
            }

            // If we got here, it's a dead click
            this.si.capture('dead_click', this.userId, {
                tagName: target.tagName,
                className: target.className,
                x: e.clientX,
                y: e.clientY
            });
        }, true); // Capture phase to catch it before stopPropagation? Or Bubble? standard bubble is fine usually.
    }

    private isInteractive(el: HTMLElement): boolean {
        if (['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].includes(el.tagName)) return true;
        if (el.hasAttribute('onclick')) return true;
        if (el.getAttribute('role') === 'button') return true;

        // Check computed style for cursor pointer (expensive, but accurate for "interactive-looking" things)
        try {
            const style = window.getComputedStyle(el);
            if (style.cursor === 'pointer') return true;
        } catch (e) {
            // Ignore
        }

        return false;
    }
}

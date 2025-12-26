# Project Dolores Roadmap & Plan

This document tracks the high-level roadmap and progress for Project Dolores.

## Q1: The Foundational Prototype (Localhost & Telemetry)
- [ ] **Objective 1: 100% Mocking for Designer Autonomy**
    - [ ] KR 1.1: Local harness for `context` object parity.
    - [ ] KR 1.2: In-memory Redis mock with persistence simulation.
    - [ ] KR 1.3: Real-time mock (websockets/event emitter) < 100ms latency.
- [ ] **Objective 2: High-Fidelity Debug Overlay**
    - [ ] KR 2.1: Client-side logging mocks (Dark Signals) to Debug Overlay.
    - [ ] KR 2.2: Theta Sketch integration for user aggregation.
    - [ ] KR 2.3: UX validation for frustration signal identification.

## Q2: Economy & Performance Simulation
- [ ] **Objective 3: Risk-Free Virtual Economy Simulator**
    - [ ] KR 3.1: Intercept `reddit.pay()` for local UX testing.
    - [ ] KR 3.2: Inventory & Scarcity logic mock.
    - [ ] KR 3.3: Mocked `getProducts` catalog with dynamic pricing config.
- [ ] **Objective 4: Architecture Validation & Handoff**
    - [ ] KR 4.1: Sub-1 second "deployment" latency in simulator.
    - [ ] KR 4.2: 95% mocked coverage of all Devvit APIs.
    - [ ] KR 4.3: Handoff documentation and library packaging.

## Ongoing Initiatives
- [ ] Automated Instrumentation Checks.
- [ ] Opinionated Templates (Gold Gate).
- [ ] Debug Mode enhancements.

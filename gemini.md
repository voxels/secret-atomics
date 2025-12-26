# Gemini Context: Project Dolores

This file contains high-level context and instructions for AI agents (like Gemini/Antigravity) working on Project Dolores.

## Project Vision
Project Dolores is an internal-only rollout engine for Reddit, built on Devvit. It's designed to bypass standard App Review processes for rapid high-fidelity experimentation.

## Core Directives
1. **Prioritize Velocity**: Design for sub-60 minute Time-to-Value (TTV).
2. **Elevated Privileges**: Leverage "God Mode" capabilities (no rate limits, internal allowlists, custom handlers).
3. **Data Integrity**: Ensure every experiment has robust telemetry (Theta Sketches, Druid integration).
4. **Research as Retention**: Focus on features that impact user retention and session depth.

## LLM-Specific Guidance
- **Code Style**: Follow the Reddit Devvit standards (TypeScript, functional patterns).
- **Mocking**: Always use the first-party mock harness for `context.reddit` and `context.redis`.
- **Instrumentation**: Proactively suggest telemetry events for any UI interaction.

# Project Dolores

Project Dolores is an internal monolithic experimentation workbench built on the Reddit Developer Platform (Devvit).

## Project Mission
To bypass the operational friction of the third-party app review process, allowing staff to instantly deploy high-fidelity, interactive prototypes and A/B tests directly into the live Reddit feed.

## Key Goals
- **Sub-60 minute Time-to-Value (TTV)** for new experiments.
- **"God Mode" Runtime**: Zero-friction deployment, uncapped rate limits, and local simulation.
- **Research as Retention**: Focus on revenue, retention, and trustworthy data.

## Monorepo Structure
- `apps/`: Devvit applications and experiments.
- `packages/mock-harness/`: Simulation environment for `context.reddit` and `context.redis`.
- `packages/signal-integrity/`: Automated instrumentation and telemetry checks.
- `packages/ui-templates/`: Opinionated templates like "Gold Gate".
- `docs/`: Technical specifications and project roadmap.
- `infra/`: Internal deployment scripts.

## Getting Started
Refer to [plan.md](./plan.md) for the roadmap and [gemini.md](./gemini.md) for AI-specific context.

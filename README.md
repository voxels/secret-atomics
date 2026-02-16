# Secret Atomics

**Product Design and Engineering Studio** — The digital home for Secret Atomics, built with Next.js and Sanity CMS.

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** — App Router, Server Components, Turbopack
- **[Sanity CMS](https://www.sanity.io/)** — Headless CMS with visual editing
- **[TypeScript](https://www.typescriptlang.org/)** — End-to-end type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first styling
- **[next-intl](https://next-intl.dev/)** — Internationalization (en, nb)
- **[Nodemailer](https://nodemailer.com/)** — SMTP email notifications for leads

## Getting Started

### Prerequisites

- **Node.js 24+**
- **pnpm 10+**

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment template and fill in your values
cp .env.example .env.local

# Start development
pnpm dev
```

- **Frontend:** http://localhost:3000
- **Sanity Studio:** http://localhost:3000/studio

### Environment Variables

See [`.env.example`](.env.example) for all available variables. Required:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (usually `production`) |
| `NEXT_PUBLIC_BASE_URL` | Site URL (`http://localhost:3000` for dev) |

Optional but recommended:

| Variable | Description |
|---|---|
| `SANITY_WRITE_TOKEN` | Sanity editor token for form submissions |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | SMTP server for lead notification emails |
| `LEAD_NOTIFICATION_EMAIL` | Where to send lead notifications |

## Features

- 📝 **CMS-Driven Content** — Pages, articles, newsletters, events via Sanity
- 📊 **Google Analytics 4** — Consent-gated, GDPR-compliant with custom event tracking
- 🍪 **Cookie Consent** — GDPR opt-in banner with preference management
- 📧 **Lead Capture** — Contact forms with SMTP email notifications
- 🌐 **Internationalization** — Full multi-language support (en, nb)
- 🔍 **SEO** — Auto-generated sitemap, OG images, meta tags
- ♿ **Accessible** — WCAG 2.1 compliant
- 🎨 **Dark Mode** — System-aware theme switching
- 🐳 **Docker Ready** — Standalone output for containerized deployment

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (frontend)/[locale]/    # Localized site routes
│   └── (studio)/               # Sanity Studio at /studio
├── actions/                    # Server actions (form submission)
├── components/                 # UI components
├── lib/                        # Utilities, analytics, helpers
│   └── analytics/              # GA4 event tracking
├── sanity/                     # Schemas, queries, config
└── styles/                     # Global styles
```

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Biome linting
pnpm format       # Auto-format
pnpm typecheck    # TypeScript checks
pnpm test         # Run tests
```

## Deployment

Configured for **Netlify** (or any platform supporting Next.js standalone output).

Set all env vars from `.env.example` in your hosting provider's dashboard.

```bash
# Build for production
pnpm build
```

## License

Apache License 2.0 — See [LICENSE](LICENSE) for details.

Based on the [NextMedal](https://github.com/Medal-Social/NextMedal) template by Medal Social.

---

Built by [Secret Atomics](https://secretatomics.com)

# Changelog

## Unreleased

- Rebuilt on the verp project structure: Next.js 16 App Router, npm, ESLint, Prettier, Vitest, Vercel.
- Ported every existing page (Discover, Calendar, Communities, Community, Post, Sign in, Join, Dashboard, Profile) with the original design unchanged.
- Extracted the design system into `docs/UI_UX_SPEC.md`, with a frozen snapshot of the original UI in `docs/design/`.
- Better Auth now persists to Postgres through the Drizzle adapter, with Resend email verification.
- Event dates are formatted and grouped in `Asia/Kolkata`.

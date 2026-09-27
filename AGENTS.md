# vboard — Project Instructions

vboard is the events + community platform for VIT (Vidyalankar Institute of Technology, Mumbai), under voss-labs. Sister project to [verp](https://github.com/voss-labs/verp), and built on the same framework and project structure.

The product wedge: replace per-event Google Forms with unified one-click registration.

For the full plan, read `research/plan.md`. For deferred features, read `research/future.md`. Don't pollute the plan with future ideas.

CLAUDE.md is symlinked to this file — same content applies to all coding agents.

## Stack

- Next.js 16 App Router (React 19) — Server Components, Server Actions, route handlers
- TypeScript strict, ESLint (`eslint-config-next`) + Prettier (with the Tailwind plugin)
- Drizzle ORM + PostgreSQL on Neon (node-postgres against a local Docker database)
- Better Auth (email + password) with email verification via Resend
- Tailwind 4 + shadcn (base-nova style, Base UI primitives)
- Vitest for pure-logic unit tests
- Vercel for deploy, GitHub Actions for CI and production migrations
- npm

## Commands

- `npm run dev` — dev server on port 3000
- `npm run check` — typecheck, lint, format check, tests (run before commit)
- `npm run fix` — autofix lint and formatting
- `npm test` — Vitest
- `npm run dev:up` / `npm run dev:down` — local Postgres in Docker
- `npm run db:generate` — generate a migration from schema changes
- `npm run db:push` — apply schema directly (dev only)
- `npm run db:migrate` — run pending SQL migrations (production)
- `npx shadcn@latest add <component>` — install a shadcn component on demand

## Layout

- `src/app/` — routes (App Router); `globals.css` holds the design tokens
- `src/components/` — app components; `src/components/ui/` — vendored shadcn primitives
- `src/db/schema/<domain>.ts` — Drizzle tables, reexported via `src/db/schema/index.ts`
- `src/db/queries/<domain>.ts` — async functions returning plain objects
- `src/db/migrations/` — hand-reviewed SQL migrations, applied by `src/db/migrate.ts`
- `src/lib/` — auth, email, formatting and other pure helpers (`*.test.ts` beside them)
- `docs/` — product and UI/UX spec; `docs/design/` is the frozen snapshot of the original design
- `research/` — plan, future work, and investigations

## Conventions

- Validation: Zod at every server boundary
- Imports: `@/` alias (mapped to `src/`), never relative
- Formatting: Prettier (2 spaces, double quotes, no semicolons)
- File size: 200–400 lines max per file; split when bigger
- shadcn components installed on demand, not preinstalled
- Styling follows `docs/UI_UX_SPEC.md`: use the tokens and primitives in `globals.css`, not raw colours

## Identity & RBAC

- Signup gated by `@vit.edu.in` email + Resend-verified link
- 2 site roles: `admin`, `student`
- Communities (clubs/societies) host posts and events
- Flat community membership: active row in `community_member` = full rights for that community
- Permission rule: `manage post X = (site admin) OR (active community_member for X.communityId)`

## Schema notes

- `post` is unified: text announcements OR events (when `isEvent = true`, event fields populated)
- `registration` only valid for posts where `isEvent = true`
- All ID fields are UUID; rollNumber is text (trust-on-signup, no list validation in v1)
- Better Auth manages `user` / `session` / `account` / `verification` tables; we own everything else

## When adding code

- Follow verp's patterns for the data layer, routes, and components — the framework is the same
- Don't preinstall shadcn components or add features beyond what the plan specifies
- If a feature isn't in the plan, it goes in `research/future.md`, not into the codebase
- No emojis anywhere — code, comments, commits, docs
- One-line comments only when the WHY is non-obvious; never narrate the WHAT

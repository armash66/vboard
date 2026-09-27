# vboard

Events and community for VIT (Vidyalankar Institute of Technology, Mumbai), by [voss-labs](https://github.com/voss-labs).

Clubs post events. Students register with one tap. No more copy-pasted Google Forms in the WhatsApp group.

## Stack

| Layer      | Choice                                                   |
| ---------- | -------------------------------------------------------- |
| Framework  | Next.js 16 App Router, React 19                          |
| Language   | TypeScript (strict)                                      |
| Styling    | Tailwind CSS 4, shadcn (base-nova), Geist                |
| Database   | PostgreSQL on Neon, Drizzle ORM                          |
| Auth       | Better Auth (email + password), Resend verification      |
| Quality    | ESLint, Prettier, Vitest                                 |
| Deploy     | Vercel, migrations via GitHub Actions                    |

## Getting started

```bash
npm install
cp .env.development.example .env.local
npm run dev:up
npm run db:push
npm run dev
```

Open http://localhost:3000. See [docs/local-dev.md](./docs/local-dev.md) for details, and [.env.example](./.env.example) for the production variables.

## Scripts

| Script                 | What it does                                        |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Dev server with Turbopack                           |
| `npm run build`        | Production build                                    |
| `npm run check`        | Typecheck, lint, format check, and tests            |
| `npm run fix`          | Autofix lint and formatting                         |
| `npm run db:generate`  | Generate a migration from schema changes            |
| `npm run db:push`      | Push the schema directly (development)              |
| `npm run db:migrate`   | Apply pending SQL migrations (production)           |
| `npm run db:studio`    | Open Drizzle Studio                                 |

## Project structure

```text
src/
  app/            routes, layout, globals.css (design tokens)
  components/     app components
    ui/           vendored shadcn primitives
  db/
    schema/       Drizzle tables, one file per domain
    queries/      data access, one file per domain
    migrations/   SQL migrations
  lib/            auth, email, formatting helpers and their tests
docs/             UI/UX spec, local dev, design snapshot
research/         plan and future work
scripts/          operational scripts
```

## Docs

- [research/plan.md](./research/plan.md) — the v1 plan
- [research/future.md](./research/future.md) — deferred work
- [docs/UI_UX_SPEC.md](./docs/UI_UX_SPEC.md) — design system
- [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

[MIT](./LICENSE)

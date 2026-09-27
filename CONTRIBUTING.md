# Contributing to vboard

vboard is a VOSS Labs project. Contributions are welcome from all Vidyalankar students.

## Setup

1. Fork the repo and clone your fork
2. `npm install`
3. `cp .env.development.example .env.local`
4. `npm run dev:up && npm run db:push`
5. `npm run dev`

You need Docker running for the local database.

## Making changes

1. Create a branch from `main`: `git checkout -b your-branch-name`
2. Make your changes
3. Run checks before committing:

```bash
npm run check
```

4. Push and open a pull request against `main`

## Guidelines

- Read `research/plan.md` first. Features not in the plan go in `research/future.md`.
- Follow `docs/UI_UX_SPEC.md` for anything visual.
- Keep files under 400 lines; split when they grow.
- Validate with Zod at every server boundary.
- Import with the `@/` alias, never relative paths.
- No emojis in code, commits, or docs.

# Local development

```bash
npm install
npm run dev:setup
npm run dev
```

Then open http://localhost:3000/login and choose a persona.

`npm run dev:setup` (`scripts/dev-setup.ts`) takes a fresh clone to a running database in five steps:

1. **Environment** — copies `.env.development.example` to `.env.local` if it does not exist
2. **Safety check** — refuses to continue if `DATABASE_URL` or `DIRECT_URL`, in `.env.local` or the shell, points anywhere but a local database; this runs before anything destructive
3. **Database** — starts Postgres 16 with Docker Compose on host port 5434 and waits until it accepts connections
4. **Schema** — `drizzle-kit push`, then records existing SQL migrations as applied (`migrate.ts --baseline`)
5. **Demo data** — `scripts/seed-dev.ts`

You need Docker running; OrbStack works unchanged.

## Demo data

`npm run dev:seed` wipes vboard's tables and reseeds them. It refuses to run against a non-local database.

- 100 people, each with a roll number and department
- 5 communities with full teams: a lead, managers and volunteers
- 19 posts: upcoming events (open, approval-only, capacity-limited, gated location, VIT-only), two completed events with check-ins and no-shows, a cancelled event, announcements and drafts
- About 370 registrations across every status: pending, approved, rejected, cancelled, attended, no-show
- An audit log history of community creation, team changes, publishes and check-ins

Dates are relative to today, so the calendar is always populated.

## Personas

| Persona | Email | What they see |
| --- | --- | --- |
| Super admin | harshal.more@vit.edu.in | Everything, plus promoting admins |
| Site admin | neha.joshi@vit.edu.in | Every community, people, audit log |
| Community lead | aarav.mehta@vit.edu.in | GDG on Campus VIT: posts, registrations, team, settings |
| Community manager | sneha.iyer@vit.edu.in | Coding Club VIT: posts and registration decisions |
| Volunteer | rohan.desai@vit.edu.in | Coding Club VIT: registrations and check-in |
| Student | priya.nair@vit.edu.in | Own registrations: approved, pending and attended |

Only authentication is bypassed; every role resolves from the database as in production. See `docs/voss-auth.md` for the three locks that keep the switcher out of a deployed build.

## Other commands

- `npm run dev:up` / `npm run dev:down` — start or stop the container (data is kept)
- `npm run dev:reset` — destroy the container and its data, then run setup again

## Database drivers

`src/db/driver.ts` picks node-postgres for local hosts (`localhost`, `127.0.0.1`, `postgres`, ...) and the Neon HTTP driver for everything else. Force either with `DATABASE_DRIVER=pg` or `DATABASE_DRIVER=neon`.

Code must not rely on transactions: node-postgres supports them locally, but the Neon HTTP driver used in production does not.

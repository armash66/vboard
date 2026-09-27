# Local development

1. `npm install`
2. `cp .env.development.example .env.local`
3. `npm run dev:setup` starts Postgres 16 in Docker on host port 5434, pushes the schema and seeds data
4. `npm run dev`, then open http://localhost:3000/login and choose a persona

`npm run dev:seed` wipes vboard's tables and reseeds them: five communities, events with open, approval-only and gated-location registration, a draft, about 180 registrations and one persona per role. It refuses to run against a non-local database.

`src/db/driver.ts` picks node-postgres for local hosts (`localhost`, `127.0.0.1`, `postgres`, ...) and the Neon HTTP driver for everything else. Force either with `DATABASE_DRIVER=pg` or `DATABASE_DRIVER=neon`.

Code must not rely on transactions: node-postgres supports them locally, but the Neon HTTP driver used in production does not.

`npm run dev:reset` drops the database volume and runs setup again.

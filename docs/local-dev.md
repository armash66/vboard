# Local development

1. `npm install`
2. `cp .env.development.example .env.local`
3. `npm run dev:up` starts Postgres 16 in Docker on host port 5434
4. `npm run db:push` creates the schema
5. `npm run dev`

`src/db/driver.ts` picks node-postgres for local hosts (`localhost`, `127.0.0.1`, `postgres`, ...) and the Neon HTTP driver for everything else. Force either with `DATABASE_DRIVER=pg` or `DATABASE_DRIVER=neon`.

Code must not rely on transactions: node-postgres supports them locally, but the Neon HTTP driver used in production does not.

`npm run dev:reset` drops the database volume and pushes the schema again.

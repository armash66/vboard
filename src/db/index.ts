import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import type { NeonHttpDatabase } from "drizzle-orm/neon-http"
import { isLocalPostgres } from "./driver"
import * as schema from "./schema"

type Db = NeonHttpDatabase<typeof schema>

let _db: Db | null = null

function getDb(): Db {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")

  if (isLocalPostgres(url)) {
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { Pool } = require("pg")
    const { drizzle: pgDrizzle } = require("drizzle-orm/node-postgres")
    /* eslint-enable @typescript-eslint/no-require-imports */
    _db = pgDrizzle(new Pool({ connectionString: url }), { schema }) as Db
    return _db
  }

  _db = drizzle(neon(url), { schema })
  return _db
}

export const db = new Proxy({} as Db, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export type Database = typeof db

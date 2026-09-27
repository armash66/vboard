const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "host.docker.internal",
  "postgres",
  "db",
])

export function isLocalPostgres(url: string): boolean {
  if (process.env.DATABASE_DRIVER === "pg") return true
  if (process.env.DATABASE_DRIVER === "neon") return false
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
}

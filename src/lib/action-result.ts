export type ActionResult =
  { ok: true; message?: string } | { ok: false; error: string }

export const IDLE: ActionResult | null = null

export function fail(error: string): ActionResult {
  return { ok: false, error }
}

export function done(message?: string): ActionResult {
  return { ok: true, message }
}

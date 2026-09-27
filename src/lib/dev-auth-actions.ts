"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { findPersona } from "@/lib/dev-personas"
import { DEV_ACTOR_COOKIE, devAuthEnabled } from "@/lib/dev-auth-gate"

export async function signInAsPersona(formData: FormData) {
  if (!devAuthEnabled()) throw new Error("Dev sign-in is disabled")
  const persona = findPersona(String(formData.get("persona") ?? ""))
  if (!persona) throw new Error("Unknown persona")
  ;(await cookies()).set(DEV_ACTOR_COOKIE, persona.key, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
  const next = String(formData.get("next") ?? "")
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard")
}

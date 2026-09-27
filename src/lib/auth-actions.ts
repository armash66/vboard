"use server"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DEV_ACTOR_COOKIE } from "@/lib/dev-auth-gate"

export async function signOutAction() {
  const jar = await cookies()
  if (jar.get(DEV_ACTOR_COOKIE)) jar.delete(DEV_ACTOR_COOKIE)
  try {
    await auth.api.signOut({ headers: await headers() })
  } catch {}
  redirect("/")
}

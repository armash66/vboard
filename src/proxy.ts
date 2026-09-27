import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { DEV_ACTOR_COOKIE, devAuthEnabled } from "@/lib/dev-auth-gate"

const protectedRoutes = ["/dashboard"]

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  if (!isProtected) return NextResponse.next()

  const devActor =
    devAuthEnabled() && request.cookies.get(DEV_ACTOR_COOKIE)?.value
  if (getSessionCookie(request) || devActor) return NextResponse.next()

  const login = new URL("/login", request.url)
  login.searchParams.set("next", `${pathname}${search}`)
  return NextResponse.redirect(login)
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

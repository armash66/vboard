import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { VossSignIn } from "@/components/voss-sign-in"
import { Button } from "@/components/ui/button"
import { devAuthProps } from "@/lib/dev-auth"
import { signInAsPersona } from "@/lib/dev-auth-actions"
import { getSessionUser } from "@/lib/session"

export const metadata: Metadata = { title: "Sign in · vboard" }
export const dynamic = "force-dynamic"

const ERRORS: Record<string, string> = {
  account_not_linked:
    "This email already has a vboard account that could not be linked. Contact the vboard team.",
  unable_to_create_user:
    "vboard is for VIT accounts. Sign in with your @vit.edu.in VOSS account.",
}

function safeNext(value: string | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard"
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const next = safeNext(params.next)
  if (await getSessionUser()) redirect(next)
  const devAuth = await devAuthProps()
  const error = params.error
    ? (ERRORS[params.error] ?? "Sign-in did not complete. Try again.")
    : null

  return (
    <div className="grid gap-12 md:grid-cols-[1.1fr_1fr] md:items-start">
      <div className="space-y-6">
        <div className="eyebrow">Sign in</div>
        <h1 className="display-xl" style={{ color: "var(--text)" }}>
          One account for every VOSS app.
        </h1>
        <p
          className="max-w-[44ch] text-[1.05rem] leading-[1.55]"
          style={{ color: "var(--text-dim)" }}
        >
          vboard signs you in with VOSS. Your @vit.edu.in address is verified
          once at accounts.vosslabs.org, and the same account works in VERP.
        </p>
      </div>

      <div className="space-y-6">
        <section className="surface space-y-5 p-6">
          <div className="mono-label">Continue</div>
          {error && (
            <p
              role="alert"
              className="text-sm"
              style={{ color: "var(--destructive)" }}
            >
              {error}
            </p>
          )}
          <VossSignIn next={next} />
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            No passwords are stored in vboard. New to VOSS? Your account is
            created the first time you sign in.
          </p>
        </section>

        {devAuth && (
          <section
            className="surface space-y-4 p-6"
            style={{ background: "var(--bg-elevated)" }}
          >
            <div className="flex items-center justify-between">
              <div className="mono-label">Local development</div>
              <span
                className="font-mono text-[0.7rem] tracking-[0.12em] uppercase"
                style={{ color: "var(--brand)" }}
              >
                Dev only
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              Sign in as a seeded persona. Roles and permissions resolve from
              the database exactly as in production.
            </p>
            <form action={signInAsPersona} className="grid gap-2">
              <input type="hidden" name="next" value={next} />
              {devAuth.personas.map((p) => (
                <Button
                  key={p.key}
                  type="submit"
                  name="persona"
                  value={p.key}
                  variant="outline"
                  className="h-auto w-full justify-between py-2.5 text-left"
                >
                  <span className="grid gap-0.5">
                    <span className="font-medium">
                      {p.label}
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        · {p.name}
                      </span>
                    </span>
                    <span className="text-muted-foreground text-xs font-normal whitespace-normal">
                      {p.description}
                    </span>
                  </span>
                  <span aria-hidden>→</span>
                </Button>
              ))}
            </form>
          </section>
        )}
      </div>
    </div>
  )
}

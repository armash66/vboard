import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-6 text-center">
        <div className="eyebrow justify-center">Under construction</div>
        <h1 className="display-xl" style={{ color: "var(--text)" }}>
          {title}
        </h1>
        <p
          className="mx-auto max-w-[36ch] text-[1rem]"
          style={{ color: "var(--text-dim)" }}
        >
          We&apos;re building this. Check back soon.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-5 py-3 font-mono text-[0.78rem] font-medium tracking-[0.06em] uppercase"
            style={{ background: "var(--text)", color: "var(--bg)" }}
          >
            Back to discover <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}

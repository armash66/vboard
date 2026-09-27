import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { communities } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Communities · vboard" }

export default function CommunitiesPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Communities"
        title="Clubs and societies on vboard."
        description="Each community runs its own events and posts. Join one to find your people."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {communities.map((c) => (
          <Link
            key={c.id}
            href={`/communities/${c.slug}`}
            className="surface surface-hover group block p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className="grid size-11 place-items-center rounded-[var(--radius)] font-mono text-base font-semibold"
                style={{ background: "var(--text)", color: "var(--bg)" }}
              >
                {c.name.charAt(0)}
              </div>
              <span
                className="font-mono text-[0.7rem] tracking-[0.12em] uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                {c.memberCount} members
              </span>
            </div>

            <h3
              className="display-tight mt-6 text-[1.2rem] font-semibold transition-colors group-hover:text-[var(--brand)]"
              style={{ color: "var(--text)" }}
            >
              {c.name}
            </h3>
            <p
              className="mt-3 text-[0.95rem] leading-relaxed"
              style={{ color: "var(--text-dim)" }}
            >
              {c.description}
            </p>

            <div
              className="mt-5 inline-flex items-center gap-1.5 font-mono text-[0.72rem] tracking-[0.08em] uppercase"
              style={{ color: "var(--text)" }}
            >
              View community
              <ArrowUpRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

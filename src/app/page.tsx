import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { PostCard } from "@/components/post-card"
import { communities, posts } from "@/lib/mock-data"

export default function HomePage() {
  const sortedPosts = posts
    .filter((p) => p.status === "published")
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

  const totalEvents = posts.filter((p) => p.isEvent).length

  return (
    <div className="space-y-24">
      <section className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div className="space-y-6">
          <div className="eyebrow">vboard · for VIT</div>
          <h1
            className="display-xl text-balance"
            style={{ color: "var(--text)" }}
          >
            Everything happening on campus,{" "}
            <span style={{ color: "var(--brand)" }}>in one place.</span>
          </h1>
          <p
            className="max-w-[42ch] text-[1.05rem] leading-[1.55] text-pretty"
            style={{ color: "var(--text-dim)" }}
          >
            Clubs post events. You register with one tap. No more copy-pasted
            Google Forms in the WhatsApp group.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-5 py-3 font-mono text-[0.78rem] font-medium tracking-[0.06em] uppercase"
              style={{ background: "var(--text)", color: "var(--bg)" }}
            >
              Join vboard <ArrowUpRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border px-5 py-3 font-mono text-[0.78rem] font-medium tracking-[0.06em] uppercase transition-colors hover:border-[var(--text)]"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              See the calendar
            </Link>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-4 md:gap-6">
          <Stat label="Communities" value={communities.length} />
          <Stat label="Events" value={totalEvents} />
          <Stat label="Posts" value={posts.length} />
        </dl>
      </section>

      <section className="space-y-8">
        <div className="hairline-bottom flex items-end justify-between gap-6 pb-5">
          <div className="space-y-3">
            <div className="eyebrow">Discover</div>
            <h2 className="display-md" style={{ color: "var(--text)" }}>
              Latest across vboard
            </h2>
          </div>
          <Link
            href="/calendar"
            className="hidden items-center gap-1.5 font-mono text-[0.78rem] tracking-[0.06em] uppercase transition-colors hover:text-[var(--brand)] md:inline-flex"
            style={{ color: "var(--text-dim)" }}
          >
            Calendar view <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface flex flex-col gap-2 p-5">
      <dt className="mono-label">{label}</dt>
      <dd
        className="text-3xl font-semibold tracking-[-0.04em]"
        style={{ color: "var(--text)" }}
      >
        {value}
      </dd>
    </div>
  )
}

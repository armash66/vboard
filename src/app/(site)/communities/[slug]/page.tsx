import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { PostCard } from "@/components/post-card"
import {
  getActiveCommunityBySlug,
  listActiveCommunities,
} from "@/db/queries/communities"
import { listFeed } from "@/db/queries/posts"
import { getCommunityAccess, getSessionUser } from "@/lib/session"

type Props = { params: Promise<{ slug: string }> }

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const community = await getActiveCommunityBySlug((await params).slug)
  return { title: community ? `${community.name} · vboard` : "vboard" }
}

export default async function CommunityPage({ params }: Props) {
  const community = await getActiveCommunityBySlug((await params).slug)
  if (!community) notFound()

  const user = await getSessionUser()
  const [posts, all, access] = await Promise.all([
    listFeed({ signedIn: !!user, communityId: community.id }),
    listActiveCommunities(),
    user ? getCommunityAccess(user, community.slug) : null,
  ])
  const events = posts.filter((p) => p.isEvent).length
  const teamCount = all.find((c) => c.id === community.id)?.teamCount ?? 0

  return (
    <div className="space-y-12">
      <Link
        href="/communities"
        className="inline-flex items-center gap-1.5 font-mono text-[0.78rem] tracking-[0.06em] uppercase transition-colors hover:text-[var(--brand)]"
        style={{ color: "var(--text-dim)" }}
      >
        <ArrowLeft className="size-3.5" /> All communities
      </Link>

      <header className="hairline-bottom space-y-7 pb-10">
        <div className="flex items-start gap-5">
          <div
            className="grid size-14 place-items-center rounded-[var(--radius)] font-mono text-xl font-semibold"
            style={{ background: "var(--text)", color: "var(--bg)" }}
          >
            {community.name.charAt(0)}
          </div>
          <div className="flex-1 space-y-2">
            <div className="eyebrow">Community</div>
            <h1 className="display-xl" style={{ color: "var(--text)" }}>
              {community.name}
            </h1>
          </div>
        </div>

        <p
          className="max-w-[60ch] text-[1.05rem] leading-[1.55]"
          style={{ color: "var(--text-dim)" }}
        >
          {community.description}
        </p>

        <div
          className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[0.78rem]"
          style={{ color: "var(--text-dim)" }}
        >
          <Stat label="Team" value={teamCount} />
          <Stat label="Posts" value={posts.length} />
          <Stat label="Events" value={events} />
        </div>

        {access && (
          <Link
            href={`/dashboard/c/${community.slug}`}
            className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-5 py-2.5 font-mono text-[0.78rem] font-medium tracking-[0.06em] uppercase"
            style={{ background: "var(--text)", color: "var(--bg)" }}
          >
            Manage community
          </Link>
        )}
      </header>

      <section className="space-y-6">
        <div className="space-y-2">
          <div className="eyebrow">Posts and events</div>
          <h2 className="display-md" style={{ color: "var(--text)" }}>
            From {community.name}
          </h2>
        </div>

        {posts.length === 0 ? (
          <div
            className="surface p-10 text-center font-mono text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            No posts yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="text-[0.65rem] tracking-[0.14em] uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span style={{ color: "var(--text)" }}>{value}</span>
    </div>
  )
}

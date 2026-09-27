import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight, Lock } from "lucide-react"
import { formatEventRange, formatShortDate } from "@/lib/format"
import { getCommunityById, getPostBySlug, type Post } from "@/lib/mock-data"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug((await params).slug)
  return { title: post ? `${post.title} · vboard` : "vboard" }
}

export default async function PostPage({ params }: Props) {
  const post = getPostBySlug((await params).slug)
  if (!post) notFound()

  const community = getCommunityById(post.communityId)

  return (
    <article className="mx-auto max-w-3xl space-y-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 font-mono text-[0.78rem] tracking-[0.06em] uppercase transition-colors hover:text-[var(--brand)]"
        style={{ color: "var(--text-dim)" }}
      >
        <ArrowLeft className="size-3.5" /> Back to discover
      </Link>

      <header className="hairline-bottom space-y-6 pb-10">
        <div className="flex flex-wrap items-center gap-4">
          {community && (
            <Link
              href={`/communities/${community.slug}`}
              className="inline-flex items-center gap-2 transition-colors hover:text-[var(--brand)]"
              style={{ color: "var(--text)" }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: "var(--brand)" }}
                aria-hidden
              />
              <span className="font-medium">{community.name}</span>
            </Link>
          )}
          <span className="mono-label">{post.isEvent ? "Event" : "Note"}</span>
          {post.visibility === "vit_only" && (
            <span
              className="mono-label inline-flex items-center gap-1"
              style={{ color: "var(--text-muted)" }}
            >
              <Lock className="size-3" aria-hidden /> VIT only
            </span>
          )}
        </div>

        <h1
          className="display-xl text-balance"
          style={{ color: "var(--text)" }}
        >
          {post.title}
        </h1>

        <p className="font-mono text-sm" style={{ color: "var(--text-dim)" }}>
          Posted by {post.authorName}
        </p>
      </header>

      {post.isEvent && post.startsAt && <EventMeta post={post} />}

      <section className="space-y-5">
        <div className="eyebrow">About</div>
        <p
          className="text-[1.05rem] leading-[1.65] whitespace-pre-line"
          style={{ color: "var(--text)" }}
        >
          {post.body}
        </p>
      </section>

      {post.isEvent && <RegistrationCta post={post} />}
    </article>
  )
}

function EventMeta({ post }: { post: Post }) {
  if (!post.startsAt) return null
  const { date, time } = formatEventRange(post.startsAt, post.endsAt)

  return (
    <dl className="surface grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0 [&_*]:divide-[var(--border)] [&>*]:p-6">
      <MetaBlock label="When">
        <div style={{ color: "var(--text)" }}>{date}</div>
        <div className="font-mono text-sm" style={{ color: "var(--text-dim)" }}>
          {time}
        </div>
      </MetaBlock>
      <MetaBlock label="Where">
        <div style={{ color: "var(--text)" }}>
          {post.locationVisibility === "after_approval" ? (
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-4" aria-hidden /> Address after approval
            </span>
          ) : (
            (post.location ?? "TBD")
          )}
        </div>
      </MetaBlock>
      <MetaBlock label="Capacity">
        {typeof post.capacity === "number" ? (
          <>
            <div style={{ color: "var(--text)" }}>
              {post.registrationCount} / {post.capacity}
            </div>
            <div
              className="font-mono text-sm"
              style={{ color: "var(--text-dim)" }}
            >
              {post.capacity - post.registrationCount} spots left
            </div>
          </>
        ) : (
          <div style={{ color: "var(--text)" }}>Unlimited</div>
        )}
      </MetaBlock>
    </dl>
  )
}

function MetaBlock({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <dt className="mono-label">{label}</dt>
      <dd className="text-base">{children}</dd>
    </div>
  )
}

function RegistrationCta({ post }: { post: Post }) {
  const closesOn = post.registrationClosesAt
    ? formatShortDate(post.registrationClosesAt)
    : null

  return (
    <aside
      className="surface sticky bottom-4 z-10 flex flex-col items-stretch justify-between gap-5 p-6 md:flex-row md:items-center"
      style={{ background: "var(--bg-elevated)" }}
    >
      <div className="space-y-1">
        <div className="mono-label">Registration</div>
        <div className="text-base" style={{ color: "var(--text)" }}>
          {post.requiresApproval
            ? "Approval required — request to join"
            : "Open — register with one tap"}
        </div>
        {closesOn && (
          <div
            className="font-mono text-sm"
            style={{ color: "var(--text-dim)" }}
          >
            Closes {closesOn}
          </div>
        )}
      </div>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-7 py-3.5 font-mono text-[0.78rem] font-medium tracking-[0.06em] uppercase transition-colors hover:bg-[var(--accent-fg-soft)]"
        style={{ background: "var(--text)", color: "var(--bg)" }}
      >
        {post.requiresApproval ? "Request to join" : "Register"}
        <ArrowUpRight className="size-4" aria-hidden />
      </button>
    </aside>
  )
}

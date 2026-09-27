import Link from "next/link"
import { ArrowUpRight, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { bodyPreview, formatEventDate } from "@/lib/format"
import { getCommunityById, type Post } from "@/lib/mock-data"

type Props = {
  post: Post
  variant?: "default" | "compact"
}

export function PostCard({ post, variant = "default" }: Props) {
  const community = getCommunityById(post.communityId)
  const compact = variant === "compact"

  return (
    <article
      className={cn(
        "surface surface-hover group relative flex flex-col",
        compact ? "p-5" : "p-6"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {community && (
            <Link
              href={`/communities/${community.slug}`}
              className="inline-flex items-center gap-2 text-[0.78rem] font-medium transition-colors hover:text-[var(--brand)]"
              style={{ color: "var(--text)" }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: "var(--brand)" }}
                aria-hidden
              />
              {community.name}
            </Link>
          )}
        </div>
        <span
          className="font-mono text-[0.7rem] tracking-[0.12em] uppercase"
          style={{
            color: post.isEvent ? "var(--text-dim)" : "var(--text-muted)",
          }}
        >
          {post.isEvent ? "Event" : "Note"}
        </span>
      </div>

      <Link href={`/posts/${post.slug}`} className="mt-5 block">
        <h3
          className={cn(
            "display-tight font-semibold transition-colors group-hover:text-[var(--brand)]",
            compact ? "text-[1.05rem]" : "text-[1.4rem] md:text-[1.6rem]"
          )}
          style={{ color: "var(--text)" }}
        >
          {post.title}
        </h3>
      </Link>

      <p
        className={cn(
          "mt-3 leading-relaxed",
          compact ? "text-[0.85rem]" : "text-[0.95rem]"
        )}
        style={{ color: "var(--text-dim)" }}
      >
        {bodyPreview(post.body, compact ? 110 : 180)}
      </p>

      {post.isEvent && (
        <div
          className="mt-5 grid gap-x-6 gap-y-2 font-mono text-[0.78rem]"
          style={{
            gridTemplateColumns:
              "max-content max-content max-content max-content",
          }}
        >
          {post.startsAt && (
            <MetaCell
              label="When"
              value={formatEventDate(post.startsAt, post.endsAt)}
            />
          )}
          {post.location && (
            <MetaCell
              label="Where"
              value={
                post.locationVisibility === "after_approval" ? (
                  <span className="inline-flex items-center gap-1">
                    <Lock className="size-3" aria-hidden /> after approval
                  </span>
                ) : (
                  post.location
                )
              }
            />
          )}
          {typeof post.capacity === "number" && (
            <MetaCell
              label="Spots"
              value={`${post.registrationCount}/${post.capacity}`}
            />
          )}
          {post.requiresApproval && (
            <MetaCell label="Status" value="approval required" />
          )}
        </div>
      )}

      <div
        className="mt-6 flex items-center justify-between text-[0.78rem]"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="font-mono">{post.authorName}</span>
        <Link
          href={`/posts/${post.slug}`}
          className="inline-flex items-center gap-1.5 font-mono tracking-[0.08em] uppercase transition-colors hover:text-[var(--brand)]"
          style={{ color: "var(--text)" }}
        >
          {post.isEvent
            ? post.requiresApproval
              ? "Request"
              : "Register"
            : "Read"}
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </Link>
      </div>

      {post.isPinned && (
        <span
          className="absolute top-6 right-6 size-1.5 rounded-full"
          style={{ background: "var(--brand)" }}
          aria-label="Pinned"
        />
      )}
    </article>
  )
}

function MetaCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 whitespace-nowrap">
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

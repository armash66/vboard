import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Lock } from "lucide-react"
import { RegistrationPanel } from "@/components/registration-panel"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button-variants"
import { getPostDetailBySlug, type FeedPost } from "@/db/queries/posts"
import { getRegistration } from "@/db/queries/registrations"
import { formatEventRange, formatShortDate } from "@/lib/format"
import {
  canSeeLocation,
  registrationAvailability,
  seatsLeft,
} from "@/lib/registration"
import { communityCan } from "@/lib/rbac"
import { getSessionUser, roleIn } from "@/lib/session"

type Props = { params: Promise<{ slug: string }> }

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostDetailBySlug((await params).slug)
  return { title: post ? `${post.title} · vboard` : "vboard" }
}

export default async function PostPage({ params }: Props) {
  const post = await getPostDetailBySlug((await params).slug)
  if (!post) notFound()

  const user = await getSessionUser()
  const role = user ? roleIn(user, post.communityId) : null
  const canManage = !!user && communityCan(user.siteRole, role, "post:read")
  if (post.status !== "published" && !canManage) notFound()

  if (post.visibility === "vit_only" && !user) {
    return <SignInWall slug={post.slug} title={post.title} />
  }

  const registration = user ? await getRegistration(post.id, user.id) : null
  const status = registration?.status ?? null
  const showLocation = canSeeLocation(post, { status, canManage })

  return (
    <article className="mx-auto max-w-3xl space-y-12">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-[0.78rem] tracking-[0.06em] uppercase transition-colors hover:text-[var(--brand)]"
          style={{ color: "var(--text-dim)" }}
        >
          <ArrowLeft className="size-3.5" /> Back to discover
        </Link>
        {canManage && (
          <Link
            href={`/dashboard/c/${post.communitySlug}/posts/${post.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Manage
          </Link>
        )}
      </div>

      <header className="hairline-bottom space-y-6 pb-10">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/communities/${post.communitySlug}`}
            className="inline-flex items-center gap-2 transition-colors hover:text-[var(--brand)]"
            style={{ color: "var(--text)" }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: "var(--brand)" }}
              aria-hidden
            />
            <span className="font-medium">{post.communityName}</span>
          </Link>
          <span className="mono-label">{post.isEvent ? "Event" : "Note"}</span>
          {post.visibility === "vit_only" && (
            <span
              className="mono-label inline-flex items-center gap-1"
              style={{ color: "var(--text-muted)" }}
            >
              <Lock className="size-3" aria-hidden /> VIT only
            </span>
          )}
          {post.status !== "published" && (
            <Badge variant="outline" className="capitalize">
              {post.status}
            </Badge>
          )}
        </div>

        <h1
          className="display-xl text-balance"
          style={{ color: "var(--text)" }}
        >
          {post.title}
        </h1>

        {post.authorName && (
          <p className="font-mono text-sm" style={{ color: "var(--text-dim)" }}>
            Posted by {post.authorName}
          </p>
        )}
      </header>

      {post.isEvent && post.startsAt && (
        <EventMeta post={post} showLocation={showLocation} />
      )}

      <section className="space-y-5">
        <div className="eyebrow">About</div>
        <p
          className="text-[1.05rem] leading-[1.65] whitespace-pre-line"
          style={{ color: "var(--text)" }}
        >
          {post.body}
        </p>
      </section>

      {post.isEvent && (
        <RegistrationPanel
          postId={post.id}
          slug={post.slug}
          signedIn={!!user}
          requiresApproval={post.requiresApproval}
          availability={registrationAvailability(post, post.seatsTaken)}
          status={status}
          closesOn={
            post.registrationClosesAt
              ? formatShortDate(post.registrationClosesAt)
              : null
          }
          seatsLeft={seatsLeft(post.capacity, post.seatsTaken)}
        />
      )}
    </article>
  )
}

function EventMeta({
  post,
  showLocation,
}: {
  post: FeedPost
  showLocation: boolean
}) {
  if (!post.startsAt) return null
  const { date, time } = formatEventRange(
    post.startsAt,
    post.endsAt ?? undefined
  )

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
          {showLocation ? (
            (post.location ?? "TBD")
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-4" aria-hidden /> Address after approval
            </span>
          )}
        </div>
      </MetaBlock>
      <MetaBlock label="Capacity">
        {typeof post.capacity === "number" ? (
          <>
            <div style={{ color: "var(--text)" }}>
              {post.seatsTaken} / {post.capacity}
            </div>
            <div
              className="font-mono text-sm"
              style={{ color: "var(--text-dim)" }}
            >
              {Math.max(0, post.capacity - post.seatsTaken)} spots left
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

function SignInWall({ slug, title }: { slug: string; title: string }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-6 text-center">
      <div className="eyebrow justify-center">VIT only</div>
      <h1 className="display-md" style={{ color: "var(--text)" }}>
        {title}
      </h1>
      <p style={{ color: "var(--text-dim)" }}>
        This post is visible to VIT students. Sign in with your VOSS account to
        read it.
      </p>
      <Link
        href={`/login?next=/posts/${slug}`}
        className={buttonVariants({ size: "lg" })}
      >
        Sign in with VOSS
      </Link>
    </div>
  )
}

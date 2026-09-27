import Link from "next/link"
import { CalendarIcon, InboxIcon } from "lucide-react"
import {
  EmptyState,
  PageHeader,
  Panel,
  SectionCards,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/ui"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listAllCommunities } from "@/db/queries/communities"
import {
  countPublishedPosts,
  listUpcomingEventsForCommunities,
} from "@/db/queries/posts"
import { countUsers } from "@/db/queries/profiles"
import {
  countRegistrations,
  listPendingForCommunities,
  listUserRegistrations,
} from "@/db/queries/registrations"
import { formatEventDate, formatStamp } from "@/lib/format"
import { communityCan, isSiteAdmin, SITE_ROLE_LABEL } from "@/lib/rbac"
import { requireUser } from "@/lib/session"

export default async function OverviewPage() {
  const user = await requireUser()
  const admin = isSiteAdmin(user.siteRole)

  const allCommunities = admin ? await listAllCommunities() : []
  const teamIds = admin
    ? allCommunities.filter((c) => c.isActive).map((c) => c.id)
    : user.memberships.map((m) => m.communityId)
  const deciderIds = admin
    ? teamIds
    : user.memberships
        .filter((m) =>
          communityCan(user.siteRole, m.role, "registration:decide")
        )
        .map((m) => m.communityId)

  const [pending, upcoming, mine, platform] = await Promise.all([
    listPendingForCommunities(deciderIds),
    listUpcomingEventsForCommunities(teamIds),
    listUserRegistrations(user.id),
    admin
      ? Promise.all([countUsers(), countPublishedPosts(), countRegistrations()])
      : null,
  ])

  const now = new Date()
  const myUpcoming = mine.filter(
    (r) =>
      r.startsAt &&
      (r.endsAt ?? r.startsAt) >= now &&
      ["pending", "approved"].includes(r.status)
  )
  const hasTeam = user.memberships.length > 0 || admin

  return (
    <>
      <PageHeader
        title={`Hello, ${user.name.split(" ")[0]}`}
        description={
          hasTeam
            ? "What needs you across the communities you help run, and what you are attending."
            : "Your registrations and upcoming events. Community tools appear once a lead adds you to their team."
        }
        actions={
          <Link
            href="/calendar"
            className={buttonVariants({ variant: "outline" })}
          >
            <CalendarIcon data-icon="inline-start" />
            Browse events
          </Link>
        }
      />

      <SectionCards>
        {platform ? (
          <>
            <StatCard
              label="Communities"
              value={allCommunities.length}
              footer="Across vboard"
              hint={`${allCommunities.filter((c) => !c.isActive).length} archived`}
            />
            <StatCard
              label="People"
              value={platform[0]}
              footer="Signed in with VOSS"
            />
            <StatCard
              label="Published posts"
              value={platform[1].posts}
              footer={`${platform[1].events} events`}
            />
            <StatCard
              label="Pending requests"
              value={pending.length}
              badge={
                pending.length > 0 ? (
                  <Badge variant="outline">Needs review</Badge>
                ) : undefined
              }
              footer={`${platform[2]} registrations in total`}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Site role"
              value={SITE_ROLE_LABEL[user.siteRole]}
              footer="Given by vboard admins"
            />
            <StatCard
              label="Teams"
              value={user.memberships.length}
              footer="Communities you help run"
            />
            <StatCard
              label="Upcoming"
              value={myUpcoming.length}
              footer="Events you are going to"
            />
            <StatCard
              label="Pending requests"
              value={pending.length}
              badge={
                pending.length > 0 ? (
                  <Badge variant="outline">Needs review</Badge>
                ) : undefined
              }
              footer="Waiting on your decision"
            />
          </>
        )}
      </SectionCards>

      {hasTeam && (
        <div className="grid gap-6 @5xl/main:grid-cols-[1.4fr_1fr]">
          <Panel
            title="Upcoming events you run"
            description="Drafts and published events that have not ended."
            flush
          >
            {upcoming.length === 0 ? (
              <EmptyState
                title="No upcoming events"
                body="Create one from a community page."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Event</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead className="pr-6">Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="pl-6">
                        <Link
                          href={`/dashboard/c/${e.communitySlug}/posts/${e.id}`}
                          className="font-medium hover:underline"
                        >
                          {e.title}
                        </Link>
                        <div className="text-muted-foreground text-xs">
                          {e.communityName}
                          {e.status === "draft" && " · draft"}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {e.startsAt ? formatEventDate(e.startsAt) : "TBD"}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {e.seatsTaken}
                        {e.capacity ? `/${e.capacity}` : ""}
                      </TableCell>
                      <TableCell className="pr-6">
                        {e.pendingCount > 0 ? (
                          <Badge variant="outline">{e.pendingCount}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>

          <Panel
            title="Needs your decision"
            description="Oldest requests first."
            flush
          >
            {pending.length === 0 ? (
              <EmptyState
                title="All caught up"
                body="No registration requests are waiting."
              />
            ) : (
              <Table>
                <TableBody>
                  {pending.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="max-w-0 pl-6">
                        <div className="truncate font-medium">{r.name}</div>
                        <div className="text-muted-foreground truncate text-xs">
                          {r.title} · {formatStamp(r.registeredAt)}
                        </div>
                      </TableCell>
                      <TableCell className="w-0 pr-6 text-right">
                        <Link
                          href={`/dashboard/c/${r.communitySlug}/posts/${r.postId}?status=pending`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          Review
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Panel>
        </div>
      )}

      <Panel
        title="Your next events"
        action={
          <Link
            href="/dashboard/registrations"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            All registrations
          </Link>
        }
        flush
      >
        {myUpcoming.length === 0 ? (
          <EmptyState
            title="You are not registered for anything yet"
            action={
              <Link href="/" className={buttonVariants({ size: "sm" })}>
                Discover events
              </Link>
            }
          />
        ) : (
          <Table>
            <TableBody>
              {myUpcoming.slice(0, 5).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-6">
                    <Link
                      href={`/posts/${r.postSlug}`}
                      className="font-medium hover:underline"
                    >
                      {r.title}
                    </Link>
                    <div className="text-muted-foreground text-xs">
                      {r.communityName} ·{" "}
                      {r.startsAt ? formatEventDate(r.startsAt) : ""}
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <StatusBadge status={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>

      {!hasTeam && (
        <Panel title="Run a community">
          <div className="text-muted-foreground flex items-start gap-3 text-sm">
            <InboxIcon className="mt-0.5 size-4 shrink-0" />
            <p>
              Community tools are given by role. A lead can add you as a manager
              or volunteer from their Team page, and a vboard admin can create a
              new community with you as its lead.
            </p>
          </div>
        </Panel>
      )}
    </>
  )
}

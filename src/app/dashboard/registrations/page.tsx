import Link from "next/link"
import { ActionForm } from "@/components/action-form"
import { ConfirmSubmit } from "@/components/confirm-submit"
import {
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
} from "@/components/dashboard/ui"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cancelRegistrationAction } from "@/app/(site)/posts/[slug]/actions"
import { listUserRegistrations } from "@/db/queries/registrations"
import { formatEventDate } from "@/lib/format"
import { requireUser } from "@/lib/session"

export default async function MyRegistrationsPage() {
  const user = await requireUser()
  const rows = await listUserRegistrations(user.id)
  const now = new Date()

  return (
    <>
      <PageHeader
        title="My registrations"
        description="Pending requests, confirmed seats, and your history. Cancel a seat so someone else can take it."
      />
      <Panel
        flush
        title={`${rows.length} registration${rows.length === 1 ? "" : "s"}`}
      >
        {rows.length === 0 ? (
          <EmptyState
            title="No registrations yet"
            action={
              <Link href="/" className={buttonVariants({ size: "sm" })}>
                Discover events
              </Link>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Event</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const upcoming = r.startsAt && (r.endsAt ?? r.startsAt) >= now
                const cancellable =
                  upcoming &&
                  (r.status === "pending" || r.status === "approved")
                return (
                  <TableRow key={r.id}>
                    <TableCell className="pl-6">
                      <Link
                        href={`/posts/${r.postSlug}`}
                        className="font-medium hover:underline"
                      >
                        {r.title}
                      </Link>
                      <div className="text-muted-foreground text-xs">
                        {r.communityName}
                        {r.postStatus === "cancelled" && " · event cancelled"}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.startsAt ? formatEventDate(r.startsAt) : "TBD"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {cancellable && (
                        <ActionForm
                          action={cancelRegistrationAction}
                          className="inline"
                        >
                          <input type="hidden" name="postId" value={r.postId} />
                          <ConfirmSubmit
                            label="Cancel"
                            title="Cancel this registration?"
                            description={`You will lose your place at ${r.title}.`}
                            confirmLabel="Cancel registration"
                          />
                        </ActionForm>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Panel>
    </>
  )
}

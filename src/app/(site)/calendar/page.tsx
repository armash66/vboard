import type { Metadata } from "next"
import { EventCalendar } from "@/components/event-calendar"
import { PageHeader } from "@/components/page-header"
import { listEvents } from "@/db/queries/posts"
import { getSessionUser } from "@/lib/session"

export const metadata: Metadata = { title: "Calendar · vboard" }
export const dynamic = "force-dynamic"

export default async function CalendarPage() {
  const user = await getSessionUser()
  const events = await listEvents({ signedIn: !!user })
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Calendar"
        title="What's on, day by day."
        description="Click a marked day to see events scheduled for that date."
      />
      <EventCalendar events={events} />
    </div>
  )
}

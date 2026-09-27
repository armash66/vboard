import type { Metadata } from "next"
import { EventCalendar } from "@/components/event-calendar"
import { PageHeader } from "@/components/page-header"
import { getEvents } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Calendar · vboard" }

export default function CalendarPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Calendar"
        title="What's on, day by day."
        description="Click a marked day to see events scheduled for that date."
      />
      <EventCalendar events={getEvents()} />
    </div>
  )
}

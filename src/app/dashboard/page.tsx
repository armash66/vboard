import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { UnderConstruction } from "@/components/under-construction"

export const metadata: Metadata = { title: "Dashboard · vboard" }

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Dashboard"
        title="Community admin"
        description="The control room for community managers. See registrations, approve requests, export attendees."
        width="52ch"
      />

      <UnderConstruction
        phase="Phase 5"
        title="Registrations and moderation"
        description="This is where community admins will manage everything they host. The page is wired into the design system but the data layer ships with Phase 5 in research/plan.md."
        upcoming={[
          "Per-community view of all your posts and events",
          "Per-event registrations table with name, roll number, department, status",
          "Approve and reject pending registrations in bulk",
          "Export registrations as CSV",
          "Edit, cancel, or pin posts",
          "Manage community membership",
        ]}
      />
    </div>
  )
}

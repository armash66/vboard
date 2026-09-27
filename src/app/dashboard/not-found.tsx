import Link from "next/link"
import { EmptyState, Panel } from "@/components/dashboard/ui"
import { buttonVariants } from "@/components/ui/button-variants"

export default function DashboardNotFound() {
  return (
    <Panel>
      <EmptyState
        title="This page does not exist, or your role does not include it."
        action={
          <Link href="/dashboard" className={buttonVariants()}>
            Back to overview
          </Link>
        }
      />
    </Panel>
  )
}

import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { UnderConstruction } from "@/components/under-construction"

export const metadata: Metadata = { title: "Profile · vboard" }

export default function ProfilePage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Profile"
        title="Your profile"
        description="Roll number, department, posts you've authored, events you've registered for."
        width="52ch"
      />

      <UnderConstruction
        phase="Phase 1"
        title="Profile management"
        description="Your account details, the events you've signed up for, the posts you've authored, the communities you belong to. Lands with auth in Phase 1."
        upcoming={[
          "Edit name, roll number, department, bio",
          "Avatar upload to Cloudflare R2",
          "Posts you've authored",
          "Events you're registered for, with status",
          "Communities you're a member of",
          "Account settings: change password, sign out everywhere",
        ]}
      />
    </div>
  )
}

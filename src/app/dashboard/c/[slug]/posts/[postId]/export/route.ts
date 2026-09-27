import { NextResponse } from "next/server"
import { getPostById } from "@/db/queries/posts"
import { listRegistrations } from "@/db/queries/registrations"
import { toCsv } from "@/lib/csv"
import { slugify } from "@/lib/slug"
import { getCommunityAccess, getSessionUser } from "@/lib/session"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; postId: string }> }
) {
  const { slug, postId } = await params
  const user = await getSessionUser()
  if (!user) return new NextResponse("Unauthorized", { status: 401 })
  const access = await getCommunityAccess(user, slug)
  if (!access?.can("registration:export"))
    return new NextResponse("Not found", { status: 404 })
  const post = /^[0-9a-f-]{36}$/.test(postId) ? await getPostById(postId) : null
  if (!post || post.communityId !== access.community.id)
    return new NextResponse("Not found", { status: 404 })

  const rows = await listRegistrations(post.id)
  const csv = toCsv(
    [
      "Name",
      "Email",
      "Roll number",
      "Department",
      "Status",
      "Registered at",
      "Checked in at",
    ],
    rows.map((r) => [
      r.name,
      r.email,
      r.rollNumber,
      r.department,
      r.status,
      r.registeredAt,
      r.checkedInAt,
    ])
  )
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slugify(post.title) || "event"}-registrations.csv"`,
      "Cache-Control": "no-store",
    },
  })
}

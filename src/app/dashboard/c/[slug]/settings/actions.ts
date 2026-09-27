"use server"

import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/db/queries/audit"
import { updateCommunity } from "@/db/queries/communities"
import { communityFormSchema, firstIssue } from "@/db/validations"
import { done, fail, type ActionResult } from "@/lib/action-result"
import { actionCommunityAccess } from "@/lib/session"

export async function updateCommunityAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const access = await actionCommunityAccess(
    formData.get("slug"),
    "community:update"
  )
  if (!access) return fail("You cannot edit this community.")
  const parsed = communityFormSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
  })
  if (!parsed.success) return fail(firstIssue(parsed.error))

  await updateCommunity(access.community.id, parsed.data)
  await createAuditLog({
    actorId: access.user.id,
    action: "community.updated",
    targetType: "community",
    targetId: access.community.id,
    communityId: access.community.id,
    details: { name: parsed.data.name },
  })
  revalidatePath(`/dashboard/c/${access.community.slug}`, "layout")
  revalidatePath(`/communities/${access.community.slug}`)
  revalidatePath("/communities")
  return done("Community updated.")
}

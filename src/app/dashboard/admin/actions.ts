"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createAuditLog } from "@/db/queries/audit"
import {
  createCommunity,
  getCommunityById,
  getCommunityBySlug,
  setCommunityActive,
} from "@/db/queries/communities"
import { upsertMember } from "@/db/queries/members"
import { getProfile, getUserByEmail, setSiteRole } from "@/db/queries/profiles"
import { firstIssue, newCommunitySchema } from "@/db/validations"
import { done, fail, type ActionResult } from "@/lib/action-result"
import { isCollegeEmail } from "@/lib/identity"
import { canSetSiteRole, siteCan, type SiteRole } from "@/lib/rbac"
import { getSessionUser } from "@/lib/session"

async function actor(capability: Parameters<typeof siteCan>[1]) {
  const user = await getSessionUser()
  if (!user || !siteCan(user.siteRole, capability)) return null
  return user
}

export async function createCommunityAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await actor("community:create")
  if (!user) return fail("Only admins can create communities.")
  const parsed = newCommunitySchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
    leadEmail: formData.get("leadEmail") ?? "",
  })
  if (!parsed.success) return fail(firstIssue(parsed.error))
  const { leadEmail, ...data } = parsed.data

  if (await getCommunityBySlug(data.slug)) return fail("That address is taken.")
  let lead: Awaited<ReturnType<typeof getUserByEmail>> = null
  if (leadEmail) {
    if (!isCollegeEmail(leadEmail))
      return fail("The lead needs a @vit.edu.in address.")
    lead = await getUserByEmail(leadEmail)
    if (!lead) return fail("The lead has not signed in to vboard yet.")
  }

  const created = await createCommunity({ ...data, createdBy: user.id })
  if (lead) {
    await upsertMember({
      communityId: created.id,
      userId: lead.id,
      role: "lead",
      addedBy: user.id,
    })
  }
  await createAuditLog({
    actorId: user.id,
    action: "community.created",
    targetType: "community",
    targetId: created.id,
    communityId: created.id,
    details: { name: data.name, lead: lead?.email ?? null },
  })
  revalidatePath("/dashboard", "layout")
  revalidatePath("/communities")
  return done(
    `${data.name} created${lead ? ` with ${lead.name} as lead` : ""}.`
  )
}

export async function setCommunityActiveAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await actor("community:archive")
  if (!user) return fail("Only admins can archive communities.")
  const id = z.uuid().safeParse(formData.get("communityId"))
  const active = formData.get("active") === "true"
  if (!id.success) return fail("Unknown community.")
  const community = await getCommunityById(id.data)
  if (!community) return fail("Unknown community.")

  await setCommunityActive(community.id, active)
  await createAuditLog({
    actorId: user.id,
    action: active ? "community.restored" : "community.archived",
    targetType: "community",
    targetId: community.id,
    communityId: community.id,
    details: { name: community.name },
  })
  revalidatePath("/dashboard", "layout")
  revalidatePath("/communities")
  revalidatePath("/")
  return done(active ? "Community restored." : "Community archived.")
}

export async function setSiteRoleAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await actor("admin:manage")
  if (!user) return fail("Only the super admin can change site roles.")
  const userId = z.string().min(1).safeParse(formData.get("userId"))
  const next = z.enum(["admin", "student"]).safeParse(formData.get("siteRole"))
  if (!userId.success || !next.success) return fail("Unknown change.")

  const profile = await getProfile(userId.data)
  const current: SiteRole = profile?.siteRole ?? "student"
  if (
    !canSetSiteRole(user.siteRole, {
      current,
      next: next.data,
      isSelf: userId.data === user.id,
    })
  )
    return fail("That role change is not allowed.")

  await setSiteRole(userId.data, next.data)
  await createAuditLog({
    actorId: user.id,
    action: "user.site_role_changed",
    targetType: "user",
    targetId: userId.data,
    details: { role: next.data, previous: current },
  })
  revalidatePath("/dashboard/admin/people")
  return done(next.data === "admin" ? "Promoted to admin." : "Set to student.")
}

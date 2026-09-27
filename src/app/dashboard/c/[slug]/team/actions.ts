"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createAuditLog } from "@/db/queries/audit"
import {
  deactivateMember,
  getMember,
  getMemberById,
  setMemberRole,
  upsertMember,
} from "@/db/queries/members"
import { getUserByEmail } from "@/db/queries/profiles"
import { firstIssue, memberFormSchema } from "@/db/validations"
import { done, fail, type ActionResult } from "@/lib/action-result"
import { isCollegeEmail } from "@/lib/identity"
import {
  assignableCommunityRoles,
  canChangeMember,
  COMMUNITY_ROLE_LABEL,
  type CommunityRole,
} from "@/lib/rbac"
import { actionCommunityAccess } from "@/lib/session"

const roleSchema = z.enum(["lead", "manager", "volunteer"])

function revalidateTeam(slug: string) {
  revalidatePath(`/dashboard/c/${slug}`, "layout")
  revalidatePath("/dashboard", "layout")
}

export async function addMemberAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const access = await actionCommunityAccess(
    formData.get("slug"),
    "member:manage"
  )
  if (!access) return fail("You cannot manage this team.")
  const parsed = memberFormSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  })
  if (!parsed.success) return fail(firstIssue(parsed.error))
  const { email, role } = parsed.data

  if (
    !assignableCommunityRoles(access.user.siteRole, access.role).includes(role)
  )
    return fail(
      `You cannot appoint a ${COMMUNITY_ROLE_LABEL[role].toLowerCase()}.`
    )
  if (!isCollegeEmail(email)) return fail("Use a @vit.edu.in address.")

  const target = await getUserByEmail(email)
  if (!target)
    return fail(
      "No vboard account for that email yet. Ask them to sign in once with VOSS, then add them."
    )

  const existing = await getMember(access.community.id, target.id)
  if (existing?.isActive) {
    if (
      !canChangeMember(
        { siteRole: access.user.siteRole, communityRole: access.role },
        { role: existing.role, isSelf: target.id === access.user.id }
      )
    )
      return fail("You cannot change that member.")
  }

  await upsertMember({
    communityId: access.community.id,
    userId: target.id,
    role,
    addedBy: access.user.id,
  })
  await createAuditLog({
    actorId: access.user.id,
    action: existing?.isActive ? "member.role_changed" : "member.added",
    targetType: "user",
    targetId: target.id,
    communityId: access.community.id,
    details: {
      email,
      role,
      previous: existing?.isActive ? existing.role : null,
    },
  })
  revalidateTeam(access.community.slug)
  return done(
    `${target.name} is now a ${COMMUNITY_ROLE_LABEL[role].toLowerCase()}.`
  )
}

async function memberTarget(formData: FormData) {
  const access = await actionCommunityAccess(
    formData.get("slug"),
    "member:manage"
  )
  if (!access) return { error: "You cannot manage this team." } as const
  const id = z.uuid().safeParse(formData.get("memberId"))
  if (!id.success) return { error: "Unknown member." } as const
  const member = await getMemberById(id.data)
  if (!member || member.communityId !== access.community.id || !member.isActive)
    return { error: "Unknown member." } as const
  if (
    !canChangeMember(
      { siteRole: access.user.siteRole, communityRole: access.role },
      { role: member.role, isSelf: member.userId === access.user.id }
    )
  )
    return { error: "You cannot change that member." } as const
  return { access, member } as const
}

export async function changeMemberRoleAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const target = await memberTarget(formData)
  if ("error" in target) return fail(target.error!)
  const { access, member } = target
  const role = roleSchema.safeParse(formData.get("role"))
  if (!role.success) return fail("Unknown role.")
  const next: CommunityRole = role.data
  if (
    !assignableCommunityRoles(access.user.siteRole, access.role).includes(next)
  )
    return fail(
      `You cannot appoint a ${COMMUNITY_ROLE_LABEL[next].toLowerCase()}.`
    )
  if (next === member.role) return done()

  await setMemberRole(member.id, next)
  await createAuditLog({
    actorId: access.user.id,
    action: "member.role_changed",
    targetType: "user",
    targetId: member.userId,
    communityId: access.community.id,
    details: { role: next, previous: member.role },
  })
  revalidateTeam(access.community.slug)
  return done(`Role changed to ${COMMUNITY_ROLE_LABEL[next].toLowerCase()}.`)
}

export async function removeMemberAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const target = await memberTarget(formData)
  if ("error" in target) return fail(target.error!)
  const { access, member } = target

  await deactivateMember(member.id)
  await createAuditLog({
    actorId: access.user.id,
    action: "member.removed",
    targetType: "user",
    targetId: member.userId,
    communityId: access.community.id,
    details: { role: member.role },
  })
  revalidateTeam(access.community.slug)
  return done("Removed from the team.")
}

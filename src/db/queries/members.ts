import { and, asc, eq, sql } from "drizzle-orm"
import { db } from "@/db"
import { communityMember, profile, user } from "@/db/schema"
import type { CommunityRole } from "@/lib/rbac"

export async function listMembers(communityId: string) {
  return db
    .select({
      id: communityMember.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: communityMember.role,
      joinedAt: communityMember.joinedAt,
      rollNumber: profile.rollNumber,
      department: profile.department,
    })
    .from(communityMember)
    .innerJoin(user, eq(user.id, communityMember.userId))
    .leftJoin(profile, eq(profile.userId, user.id))
    .where(
      and(
        eq(communityMember.communityId, communityId),
        eq(communityMember.isActive, true)
      )
    )
    .orderBy(
      sql`case ${communityMember.role} when 'lead' then 0 when 'manager' then 1 else 2 end`,
      asc(user.name)
    )
}

export async function getMember(communityId: string, userId: string) {
  const row = await db.query.communityMember.findFirst({
    where: and(
      eq(communityMember.communityId, communityId),
      eq(communityMember.userId, userId)
    ),
  })
  return row ?? null
}

export async function getMemberById(id: string) {
  const row = await db.query.communityMember.findFirst({
    where: eq(communityMember.id, id),
  })
  return row ?? null
}

export async function upsertMember(data: {
  communityId: string
  userId: string
  role: CommunityRole
  addedBy: string
}) {
  await db
    .insert(communityMember)
    .values({ ...data, isActive: true })
    .onConflictDoUpdate({
      target: [communityMember.communityId, communityMember.userId],
      set: {
        role: data.role,
        isActive: true,
        addedBy: data.addedBy,
        updatedAt: new Date(),
      },
    })
}

export async function setMemberRole(id: string, role: CommunityRole) {
  await db
    .update(communityMember)
    .set({ role, updatedAt: new Date() })
    .where(eq(communityMember.id, id))
}

export async function deactivateMember(id: string) {
  await db
    .update(communityMember)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(communityMember.id, id))
}

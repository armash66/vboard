import { and, asc, desc, eq, inArray, sql } from "drizzle-orm"
import { db } from "@/db"
import { community, post, profile, registration, user } from "@/db/schema"
import type { RegistrationStatus } from "@/lib/registration"

export async function getRegistration(postId: string, userId: string) {
  const row = await db.query.registration.findFirst({
    where: and(
      eq(registration.postId, postId),
      eq(registration.userId, userId)
    ),
  })
  return row ?? null
}

export async function getRegistrationById(id: string) {
  const row = await db.query.registration.findFirst({
    where: eq(registration.id, id),
  })
  return row ?? null
}

export async function upsertRegistration(data: {
  postId: string
  userId: string
  status: RegistrationStatus
}) {
  await db
    .insert(registration)
    .values(data)
    .onConflictDoUpdate({
      target: [registration.postId, registration.userId],
      set: {
        status: data.status,
        registeredAt: new Date(),
        decidedBy: null,
        decidedAt: null,
        checkedInAt: null,
        updatedAt: new Date(),
      },
    })
}

export async function setRegistrationStatus(
  ids: string[],
  status: RegistrationStatus,
  actorId: string | null
) {
  if (ids.length === 0) return
  const now = new Date()
  await db
    .update(registration)
    .set({
      status,
      decidedBy: actorId,
      decidedAt: now,
      checkedInAt: status === "attended" ? now : null,
      updatedAt: now,
    })
    .where(inArray(registration.id, ids))
}

export async function listRegistrations(postId: string) {
  return db
    .select({
      id: registration.id,
      status: registration.status,
      registeredAt: registration.registeredAt,
      checkedInAt: registration.checkedInAt,
      userId: user.id,
      name: user.name,
      email: user.email,
      rollNumber: profile.rollNumber,
      department: profile.department,
    })
    .from(registration)
    .innerJoin(user, eq(user.id, registration.userId))
    .leftJoin(profile, eq(profile.userId, user.id))
    .where(eq(registration.postId, postId))
    .orderBy(asc(registration.registeredAt))
}

export async function listUserRegistrations(userId: string) {
  return db
    .select({
      id: registration.id,
      status: registration.status,
      registeredAt: registration.registeredAt,
      postId: post.id,
      postSlug: post.slug,
      title: post.title,
      startsAt: post.startsAt,
      endsAt: post.endsAt,
      postStatus: post.status,
      communityName: community.name,
    })
    .from(registration)
    .innerJoin(post, eq(post.id, registration.postId))
    .innerJoin(community, eq(community.id, post.communityId))
    .where(eq(registration.userId, userId))
    .orderBy(desc(post.startsAt))
}

export async function listPendingForCommunities(communityIds: string[]) {
  if (communityIds.length === 0) return []
  return db
    .select({
      id: registration.id,
      registeredAt: registration.registeredAt,
      name: user.name,
      postId: post.id,
      title: post.title,
      communitySlug: community.slug,
    })
    .from(registration)
    .innerJoin(post, eq(post.id, registration.postId))
    .innerJoin(community, eq(community.id, post.communityId))
    .innerJoin(user, eq(user.id, registration.userId))
    .where(
      and(
        inArray(post.communityId, communityIds),
        eq(registration.status, "pending")
      )
    )
    .orderBy(asc(registration.registeredAt))
    .limit(20)
}

export async function countRegistrations() {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(registration)
  return row?.n ?? 0
}

import { config } from "dotenv"
config({ path: ".env.local" })

import { randomUUID } from "node:crypto"
import { eq, inArray, sql } from "drizzle-orm"
import { db } from "@/db"
import {
  auditLog,
  community,
  communityMember,
  post,
  profile,
  registration,
  user,
} from "@/db/schema"
import { isLocalPostgres } from "@/db/driver"
import { DEV_PERSONAS } from "@/lib/dev-personas"
import type { CommunityRole } from "@/lib/rbac"
import type { RegistrationStatus } from "@/lib/registration"
import { communities, posts } from "./lib/fixtures"

const AUTHORS = [
  { name: "Devansh Shah", email: "devansh.shah@vit.edu.in" },
  { name: "Riya Kulkarni", email: "riya.kulkarni@vit.edu.in" },
  { name: "Karthik Iyer", email: "karthik.iyer@vit.edu.in" },
  { name: "Sneha Pawar", email: "sneha.pawar@vit.edu.in" },
]

const FIRST = [
  "Aditi",
  "Arjun",
  "Diya",
  "Ishaan",
  "Kavya",
  "Mihir",
  "Nikita",
  "Omkar",
  "Pooja",
  "Rahul",
  "Sanya",
  "Tanmay",
  "Vedika",
  "Yash",
  "Zoya",
  "Aniket",
  "Bhavna",
  "Chirag",
  "Esha",
  "Gaurav",
]
const LAST = [
  "Patil",
  "Sharma",
  "Kulkarni",
  "Deshmukh",
  "Rao",
  "Gupta",
  "Joshi",
  "Naik",
]
const DEPARTMENTS = ["CMPN", "INFT", "EXTC", "BIOMED"]

const MEMBERSHIPS: { email: string; slug: string; role: CommunityRole }[] = [
  { email: "aarav.mehta@vit.edu.in", slug: "gdg-vit", role: "lead" },
  { email: "devansh.shah@vit.edu.in", slug: "coding-club", role: "lead" },
  { email: "sneha.iyer@vit.edu.in", slug: "coding-club", role: "manager" },
  { email: "rohan.desai@vit.edu.in", slug: "coding-club", role: "volunteer" },
  { email: "riya.kulkarni@vit.edu.in", slug: "drama-society", role: "lead" },
  { email: "karthik.iyer@vit.edu.in", slug: "chess-club", role: "lead" },
  { email: "sneha.pawar@vit.edu.in", slug: "ieee-vit", role: "lead" },
]

async function upsertUser(name: string, email: string) {
  const existing = await db.query.user.findFirst({
    where: eq(user.email, email),
    columns: { id: true },
  })
  if (existing) return existing.id
  const id = randomUUID()
  const now = new Date()
  await db.insert(user).values({
    id,
    name,
    email,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  })
  return id
}

async function run() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  if (!isLocalPostgres(url) && process.env.SEED_ANY_DATABASE !== "1") {
    throw new Error(
      `Refusing to seed ${new URL(url).hostname}. The seed wipes vboard data and is for local databases only.`
    )
  }

  await db.execute(
    sql`truncate ${registration}, ${post}, ${communityMember}, ${community}, ${auditLog} cascade`
  )

  const ids = new Map<string, string>()
  for (const p of [...DEV_PERSONAS, ...AUTHORS]) {
    ids.set(p.email, await upsertUser(p.name, p.email))
  }

  const students: string[] = []
  for (let i = 0; i < 60; i++) {
    const first = FIRST[i % FIRST.length]
    const last = LAST[(i * 7) % LAST.length]
    const email = `${first}.${last}${i}@vit.edu.in`.toLowerCase()
    const id = await upsertUser(`${first} ${last}`, email)
    students.push(id)
  }

  const everyone = [...ids.values(), ...students]
  for (const [i, userId] of everyone.entries()) {
    await db
      .insert(profile)
      .values({
        userId,
        siteRole: "student",
        rollNumber: `22${String(101 + i).padStart(4, "0")}`,
        department: DEPARTMENTS[i % DEPARTMENTS.length],
      })
      .onConflictDoUpdate({
        target: profile.userId,
        set: { siteRole: "student" },
      })
  }
  await db
    .update(profile)
    .set({ siteRole: "admin" })
    .where(eq(profile.userId, ids.get("neha.joshi@vit.edu.in")!))

  const communityIds = new Map<string, string>()
  for (const c of communities) {
    const [row] = await db
      .insert(community)
      .values({
        slug: c.slug,
        name: c.name,
        description: c.description,
        createdBy: ids.get("neha.joshi@vit.edu.in"),
      })
      .returning({ id: community.id })
    communityIds.set(c.id, row.id)
    communityIds.set(c.slug, row.id)
  }

  for (const m of MEMBERSHIPS) {
    await db.insert(communityMember).values({
      communityId: communityIds.get(m.slug)!,
      userId: ids.get(m.email)!,
      role: m.role,
      addedBy: ids.get("neha.joshi@vit.edu.in"),
    })
  }

  const authorByName = new Map(
    [...DEV_PERSONAS, ...AUTHORS].map((p) => [p.name, ids.get(p.email)!])
  )

  const priya = ids.get("priya.nair@vit.edu.in")!
  let cursor = 0
  for (const p of posts) {
    const [row] = await db
      .insert(post)
      .values({
        slug: p.slug,
        communityId: communityIds.get(p.communityId)!,
        authorId: authorByName.get(p.authorName) ?? null,
        title: p.title,
        body: p.body,
        visibility: p.visibility,
        isPinned: p.isPinned,
        status: p.status,
        isEvent: p.isEvent,
        startsAt: p.startsAt ?? null,
        endsAt: p.endsAt ?? null,
        location: p.location ?? null,
        locationVisibility: p.locationVisibility ?? null,
        registrationOpensAt: p.registrationOpensAt ?? null,
        registrationClosesAt: p.registrationClosesAt ?? null,
        capacity: p.capacity ?? null,
        requiresApproval: p.requiresApproval,
        createdAt: p.createdAt,
      })
      .returning({ id: post.id })

    if (!p.isEvent) continue
    const count = Math.min(p.registrationCount, students.length)
    const rows = []
    for (let i = 0; i < count; i++) {
      const userId = students[(cursor + i) % students.length]
      const status: RegistrationStatus = p.requiresApproval
        ? i % 3 === 0
          ? "approved"
          : "pending"
        : "approved"
      rows.push({ postId: row.id, userId, status })
    }
    cursor += 7
    if (p.slug === "build-with-gemma-4" || p.slug === "monsoon-monologues") {
      rows.push({
        postId: row.id,
        userId: priya,
        status: (p.requiresApproval
          ? "pending"
          : "approved") as RegistrationStatus,
      })
    }
    if (rows.length) await db.insert(registration).values(rows)
  }

  const codingClub = communityIds.get("coding-club")!
  await db.insert(post).values({
    slug: "hacktoberfest-kickoff-draft",
    communityId: codingClub,
    authorId: ids.get("sneha.iyer@vit.edu.in"),
    title: "Hacktoberfest kickoff",
    body: "Draft: first-PR workshop and repo list for Hacktoberfest.",
    status: "draft",
  })

  const counts = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(registration)
    .where(inArray(registration.status, ["approved", "pending"]))
  console.log(
    `Seeded ${communities.length} communities, ${posts.length + 1} posts, ${counts[0].n} registrations, ${everyone.length} users.`
  )
  console.log("Personas:")
  for (const p of DEV_PERSONAS)
    console.log(`  ${p.label.padEnd(18)} ${p.email}`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

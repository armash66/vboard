import { cache } from "react"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { devIdentity } from "@/lib/dev-auth"
import { parseEmailList, normalizeEmail } from "@/lib/identity"
import {
  communityCan,
  communityCapabilities,
  isSiteAdmin,
  siteCan,
  type CommunityCapability,
  type CommunityRole,
  type SiteCapability,
  type SiteRole,
} from "@/lib/rbac"
import { getProfile } from "@/db/queries/profiles"
import {
  getCommunityBySlug,
  listMembershipsForUser,
} from "@/db/queries/communities"

export type Membership = {
  communityId: string
  slug: string
  name: string
  role: CommunityRole
}

export type SessionUser = {
  id: string
  name: string
  email: string
  image: string | null
  siteRole: SiteRole
  rollNumber: string | null
  department: string | null
  bio: string | null
  memberships: Membership[]
}

async function realIdentity() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  }
}

function isSuperAdminEmail(email: string): boolean {
  return parseEmailList(process.env.SUPER_ADMIN_EMAILS).includes(
    normalizeEmail(email)
  )
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const identity = (await devIdentity()) ?? (await realIdentity())
  if (!identity) return null

  const [profile, memberships] = await Promise.all([
    getProfile(identity.id),
    listMembershipsForUser(identity.id),
  ])

  const siteRole: SiteRole = isSuperAdminEmail(identity.email)
    ? "super_admin"
    : (profile?.siteRole ?? "student")

  return {
    ...identity,
    siteRole,
    rollNumber: profile?.rollNumber ?? null,
    department: profile?.department ?? null,
    bio: profile?.bio ?? null,
    memberships,
  }
})

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  return user
}

export async function requireSiteCapability(
  capability: SiteCapability
): Promise<SessionUser> {
  const user = await requireUser()
  if (!siteCan(user.siteRole, capability)) notFound()
  return user
}

export function roleIn(
  user: SessionUser,
  communityId: string
): CommunityRole | null {
  return (
    user.memberships.find((m) => m.communityId === communityId)?.role ?? null
  )
}

export type CommunityAccess = {
  user: SessionUser
  community: NonNullable<Awaited<ReturnType<typeof getCommunityBySlug>>>
  role: CommunityRole | null
  capabilities: ReadonlySet<CommunityCapability>
  can: (capability: CommunityCapability) => boolean
}

export async function getCommunityAccess(
  user: SessionUser,
  slug: string
): Promise<CommunityAccess | null> {
  const community = await getCommunityBySlug(slug)
  if (!community) return null
  const role = roleIn(user, community.id)
  const capabilities = communityCapabilities(user.siteRole, role)
  if (capabilities.size === 0) return null
  return {
    user,
    community,
    role,
    capabilities,
    can: (capability) => communityCan(user.siteRole, role, capability),
  }
}

export async function requireCommunityAccess(
  slug: string,
  capability: CommunityCapability = "post:read"
): Promise<CommunityAccess> {
  const user = await requireUser()
  const access = await getCommunityAccess(user, slug)
  if (!access || !access.can(capability)) notFound()
  return access
}

export async function actionCommunityAccess(
  slug: unknown,
  capability: CommunityCapability
): Promise<CommunityAccess | null> {
  if (typeof slug !== "string" || !slug) return null
  const user = await getSessionUser()
  if (!user) return null
  const access = await getCommunityAccess(user, slug)
  if (!access || !access.can(capability)) return null
  if (!access.community.isActive && !isSiteAdmin(user.siteRole)) return null
  return access
}

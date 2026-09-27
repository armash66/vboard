export type SiteRole = "super_admin" | "admin" | "student"
export type CommunityRole = "lead" | "manager" | "volunteer"

export type SiteCapability =
  | "admin:manage"
  | "community:create"
  | "community:archive"
  | "community:assignLead"
  | "user:read"
  | "post:moderate"
  | "audit:read"

export type CommunityCapability =
  | "community:update"
  | "member:read"
  | "member:manage"
  | "post:read"
  | "post:write"
  | "post:publish"
  | "post:delete"
  | "registration:read"
  | "registration:decide"
  | "registration:checkin"
  | "registration:export"

export const SITE_ROLE_LABEL: Record<SiteRole, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  student: "Student",
}

export const COMMUNITY_ROLE_LABEL: Record<CommunityRole, string> = {
  lead: "Lead",
  manager: "Manager",
  volunteer: "Volunteer",
}

export const COMMUNITY_ROLE_DESCRIPTION: Record<CommunityRole, string> = {
  lead: "Runs the community: settings, team, and everything a manager can do.",
  manager: "Creates and publishes posts and events, decides registrations.",
  volunteer: "Sees drafts and registrations, checks attendees in at the door.",
}

const SITE_CAPABILITIES: Record<SiteRole, ReadonlySet<SiteCapability>> = {
  super_admin: new Set<SiteCapability>([
    "admin:manage",
    "community:create",
    "community:archive",
    "community:assignLead",
    "user:read",
    "post:moderate",
    "audit:read",
  ]),
  admin: new Set<SiteCapability>([
    "community:create",
    "community:archive",
    "community:assignLead",
    "user:read",
    "post:moderate",
    "audit:read",
  ]),
  student: new Set<SiteCapability>(),
}

const VOLUNTEER: CommunityCapability[] = [
  "member:read",
  "post:read",
  "registration:read",
  "registration:checkin",
]

const MANAGER: CommunityCapability[] = [
  ...VOLUNTEER,
  "post:write",
  "post:publish",
  "post:delete",
  "registration:decide",
  "registration:export",
]

const LEAD: CommunityCapability[] = [
  ...MANAGER,
  "community:update",
  "member:manage",
]

const COMMUNITY_CAPABILITIES: Record<
  CommunityRole,
  ReadonlySet<CommunityCapability>
> = {
  lead: new Set(LEAD),
  manager: new Set(MANAGER),
  volunteer: new Set(VOLUNTEER),
}

export const COMMUNITY_ROLE_RANK: Record<CommunityRole, number> = {
  lead: 3,
  manager: 2,
  volunteer: 1,
}

export function isSiteAdmin(role: SiteRole): boolean {
  return role === "admin" || role === "super_admin"
}

export function siteCan(role: SiteRole, capability: SiteCapability): boolean {
  return SITE_CAPABILITIES[role].has(capability)
}

export function communityCan(
  siteRole: SiteRole,
  communityRole: CommunityRole | null,
  capability: CommunityCapability
): boolean {
  if (isSiteAdmin(siteRole)) return true
  if (!communityRole) return false
  return COMMUNITY_CAPABILITIES[communityRole].has(capability)
}

export function communityCapabilities(
  siteRole: SiteRole,
  communityRole: CommunityRole | null
): ReadonlySet<CommunityCapability> {
  if (isSiteAdmin(siteRole)) return COMMUNITY_CAPABILITIES.lead
  if (!communityRole) return new Set()
  return COMMUNITY_CAPABILITIES[communityRole]
}

export function assignableCommunityRoles(
  siteRole: SiteRole,
  communityRole: CommunityRole | null
): CommunityRole[] {
  if (siteCan(siteRole, "community:assignLead"))
    return ["lead", "manager", "volunteer"]
  if (communityRole === "lead") return ["manager", "volunteer"]
  return []
}

export function canChangeMember(
  actor: { siteRole: SiteRole; communityRole: CommunityRole | null },
  target: { role: CommunityRole; isSelf: boolean }
): boolean {
  if (siteCan(actor.siteRole, "community:assignLead")) return true
  if (!communityCan(actor.siteRole, actor.communityRole, "member:manage"))
    return false
  if (target.isSelf) return false
  return target.role !== "lead"
}

export function canSetSiteRole(
  actor: SiteRole,
  target: { current: SiteRole; next: SiteRole; isSelf: boolean }
): boolean {
  if (!siteCan(actor, "admin:manage")) return false
  if (target.isSelf) return false
  if (target.current === "super_admin" || target.next === "super_admin")
    return false
  return true
}

# vboard RBAC

How vboard decides who can do what, what ships in the MVP, and where it grows next.

Source of truth in code: `src/lib/rbac.ts` (capabilities, pure and unit-tested) and `src/lib/session.ts` (who the caller is, resolved from the database on every request).

## Principles

1. **Identity is VOSS, roles are vboard.** VOSS proves the caller owns a verified `@vit.edu.in` mailbox and nothing else. Every role lives in vboard's own database.
2. **Capability, then scope.** A capability says what kind of action is allowed (`registration:decide`). Scope says where: a community role only applies inside that community.
3. **Server authoritative.** Every server action re-resolves the caller and re-checks the capability. Hiding a button is a courtesy, not a control.
4. **Deny by absence.** A page the caller has no capability for returns 404, not a disabled screen, so the existence of other communities' drafts and registrations is not leaked.
5. **Every privileged write is audited** in `audit_log`: role changes, publishes, deletions, bulk registration decisions, community lifecycle.

## Layers (MVP)

### Layer 0 — Visitor (not signed in)

- Browse public posts, events, communities and the calendar.
- `vit_only` posts show a sign-in wall; gated locations stay hidden.

### Layer 1 — Student (every VOSS-verified VIT account)

Granted automatically on first sign-in; no roster matching.

- See `vit_only` posts.
- Register for events, cancel their own registration, see their status.
- See a gated location once their registration is approved.
- Edit their profile (roll number, department, bio).

### Layer 2 — Community team (per community, `community_member.role`)

| Capability | Volunteer | Manager | Lead |
| --- | :-: | :-: | :-: |
| See the community dashboard and drafts (`post:read`) | yes | yes | yes |
| See the team (`member:read`) | yes | yes | yes |
| See registrations (`registration:read`) | yes | yes | yes |
| Check people in, mark no-show (`registration:checkin`) | yes | yes | yes |
| Create and edit posts (`post:write`) | | yes | yes |
| Publish, unpublish, pin, cancel, complete (`post:publish`) | | yes | yes |
| Delete posts (`post:delete`) | | yes | yes |
| Approve and reject registrations (`registration:decide`) | | yes | yes |
| Export registrations CSV (`registration:export`) | | yes | yes |
| Edit community details (`community:update`) | | | yes |
| Add, change and remove managers and volunteers (`member:manage`) | | | yes |

Rules a lead cannot bypass:

- A lead appoints managers and volunteers, never another lead.
- A lead cannot change or remove another lead, or demote themselves; that goes through a site admin so a community is never left without a lead by accident.

### Layer 3 — Site admin (`profile.site_role = admin`)

- Every community capability in every community, without a membership row.
- Create communities and appoint their first lead (`community:create`, `community:assignLead`).
- Archive and restore communities (`community:archive`). Archiving hides the community and its posts and removes the team's dashboard access; nothing is deleted.
- See everyone who has signed in (`user:read`) and the audit log (`audit:read`).

### Layer 4 — Super admin (`SUPER_ADMIN_EMAILS`)

- The bootstrap seam: an allowlisted email is super admin with or without a database row, which is how the first admin exists.
- Promotes students to admin and steps admins back down (`admin:manage`).
- Cannot be granted or removed from the UI, and cannot change their own role.

## Enforcement map

| Where | How |
| --- | --- |
| `src/proxy.ts` | `/dashboard/*` requires a session cookie (or the dev persona cookie locally) |
| Server components | `requireUser`, `requireSiteCapability`, `requireCommunityAccess(slug, capability)` call `notFound()` on failure |
| Server actions | `actionCommunityAccess(slug, capability)` and site checks, then ownership checks (the post or member must belong to that community) |
| Route handlers | CSV export re-checks `registration:export` for the post's community |
| Pure rules | `communityCan`, `siteCan`, `canChangeMember`, `canSetSiteRole`, `assignableCommunityRoles` in `src/lib/rbac.ts`, covered by `src/lib/rbac.test.ts` |

## Next layers (not in the MVP)

In rough order of usefulness. Each goes into `research/future.md` until its trigger condition arrives.

1. **Per-event co-hosts** — give a person manager rights on one event rather than the whole community. Trigger: joint events between two clubs.
2. **Faculty advisor role** — read-only oversight across a community plus approval of events above a size or budget. Trigger: the college asks for sign-off on events.
3. **Community approval workflow** — students request a new community; admins approve instead of creating it by hand. Trigger: more than a handful of new clubs a semester.
4. **Capability overrides** — verp-style `permission_overrides` table so a super admin can grant or revoke a single capability for a role or a person without a deploy. Trigger: the first "managers should not be able to delete" request.
5. **Department scope for admins** — an admin limited to communities of one department. Trigger: department-level student councils run their own clubs.
6. **Pending invites** — add a team member by email before they have ever signed in; the membership activates on first sign-in. Trigger: leads complain about the "sign in once first" step.
7. **Audience targeting** — events restricted by year, department or division, enforced at registration. Needs `year`/`division` on `profile`.
8. **Session and role review** — admins see active sessions per user and revoke them, mirroring VOSS's central revoke.

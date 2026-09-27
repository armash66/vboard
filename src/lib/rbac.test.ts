import { describe, expect, it } from "vitest"
import {
  assignableCommunityRoles,
  canChangeMember,
  canSetSiteRole,
  communityCan,
  siteCan,
} from "@/lib/rbac"

describe("site capabilities", () => {
  it("gives students no site capability", () => {
    expect(siteCan("student", "community:create")).toBe(false)
    expect(siteCan("student", "audit:read")).toBe(false)
  })

  it("lets admins run communities but not appoint admins", () => {
    expect(siteCan("admin", "community:create")).toBe(true)
    expect(siteCan("admin", "admin:manage")).toBe(false)
  })

  it("reserves admin appointment for the super admin", () => {
    expect(siteCan("super_admin", "admin:manage")).toBe(true)
  })
})

describe("community capabilities", () => {
  it("denies a student with no role in the community", () => {
    expect(communityCan("student", null, "post:read")).toBe(false)
  })

  it("lets volunteers check in but not decide", () => {
    expect(communityCan("student", "volunteer", "registration:checkin")).toBe(
      true
    )
    expect(communityCan("student", "volunteer", "registration:decide")).toBe(
      false
    )
    expect(communityCan("student", "volunteer", "post:write")).toBe(false)
  })

  it("lets managers publish and decide but not manage the team", () => {
    expect(communityCan("student", "manager", "post:publish")).toBe(true)
    expect(communityCan("student", "manager", "registration:decide")).toBe(true)
    expect(communityCan("student", "manager", "member:manage")).toBe(false)
    expect(communityCan("student", "manager", "community:update")).toBe(false)
  })

  it("lets leads manage the team and settings", () => {
    expect(communityCan("student", "lead", "member:manage")).toBe(true)
    expect(communityCan("student", "lead", "community:update")).toBe(true)
  })

  it("gives site admins every community capability without a membership", () => {
    expect(communityCan("admin", null, "member:manage")).toBe(true)
    expect(communityCan("super_admin", null, "registration:export")).toBe(true)
  })
})

describe("assigning community roles", () => {
  it("lets admins appoint leads", () => {
    expect(assignableCommunityRoles("admin", null)).toContain("lead")
  })

  it("lets leads appoint managers and volunteers only", () => {
    expect(assignableCommunityRoles("student", "lead")).toEqual([
      "manager",
      "volunteer",
    ])
  })

  it("lets managers appoint nobody", () => {
    expect(assignableCommunityRoles("student", "manager")).toEqual([])
  })
})

describe("changing a member", () => {
  const lead = { siteRole: "student" as const, communityRole: "lead" as const }

  it("stops a lead from changing another lead", () => {
    expect(canChangeMember(lead, { role: "lead", isSelf: false })).toBe(false)
  })

  it("stops a lead from demoting themselves", () => {
    expect(canChangeMember(lead, { role: "lead", isSelf: true })).toBe(false)
  })

  it("lets a lead change a manager", () => {
    expect(canChangeMember(lead, { role: "manager", isSelf: false })).toBe(true)
  })

  it("stops a manager from changing anyone", () => {
    expect(
      canChangeMember(
        { siteRole: "student", communityRole: "manager" },
        { role: "volunteer", isSelf: false }
      )
    ).toBe(false)
  })

  it("lets an admin change a lead", () => {
    expect(
      canChangeMember(
        { siteRole: "admin", communityRole: null },
        { role: "lead", isSelf: false }
      )
    ).toBe(true)
  })
})

describe("setting site roles", () => {
  it("lets the super admin promote a student", () => {
    expect(
      canSetSiteRole("super_admin", {
        current: "student",
        next: "admin",
        isSelf: false,
      })
    ).toBe(true)
  })

  it("stops admins from promoting anyone", () => {
    expect(
      canSetSiteRole("admin", {
        current: "student",
        next: "admin",
        isSelf: false,
      })
    ).toBe(false)
  })

  it("never grants or removes super admin", () => {
    expect(
      canSetSiteRole("super_admin", {
        current: "admin",
        next: "super_admin",
        isSelf: false,
      })
    ).toBe(false)
  })

  it("stops the super admin from changing their own role", () => {
    expect(
      canSetSiteRole("super_admin", {
        current: "admin",
        next: "student",
        isSelf: true,
      })
    ).toBe(false)
  })
})

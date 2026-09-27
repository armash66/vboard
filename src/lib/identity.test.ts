import { describe, expect, it } from "vitest"
import {
  deriveNameFromEmail,
  initials,
  isCollegeEmail,
  parseEmailList,
} from "@/lib/identity"

describe("isCollegeEmail", () => {
  it("accepts the college domain in any case", () => {
    expect(isCollegeEmail(" Harshal.More@VIT.edu.in ")).toBe(true)
  })

  it("rejects look-alike domains", () => {
    expect(isCollegeEmail("a@vit.edu.in.evil.com")).toBe(false)
    expect(isCollegeEmail("a@notvit.edu.in")).toBe(false)
  })
})

describe("parseEmailList", () => {
  it("splits, trims, lowercases and drops blanks", () => {
    expect(parseEmailList(" A@x.com, ,b@y.com ")).toEqual([
      "a@x.com",
      "b@y.com",
    ])
  })
})

describe("deriveNameFromEmail", () => {
  it("title-cases the local part", () => {
    expect(deriveNameFromEmail("harshal.more@vit.edu.in")).toBe("Harshal More")
  })
})

describe("initials", () => {
  it("takes the first and last name", () => {
    expect(initials("Aarav Kumar Mehta")).toBe("AM")
  })
})

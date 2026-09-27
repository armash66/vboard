import { describe, expect, it } from "vitest"
import { randomSuffix, slugify, uniqueSlug } from "@/lib/slug"

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Build with Gemma 4!")).toBe("build-with-gemma-4")
  })

  it("strips accents and trims hyphens", () => {
    expect(slugify("  Café Night  ")).toBe("cafe-night")
  })

  it("caps the length", () => {
    expect(slugify("a".repeat(100)).length).toBe(60)
  })
})

describe("uniqueSlug", () => {
  it("falls back to post when the title has no usable characters", () => {
    expect(uniqueSlug("!!!", "abc12")).toBe("post-abc12")
  })
})

describe("randomSuffix", () => {
  it("has the requested length", () => {
    expect(randomSuffix(7)).toHaveLength(7)
  })
})

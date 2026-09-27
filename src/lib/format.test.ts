import { describe, expect, it } from "vitest"
import {
  bodyPreview,
  campusDayKey,
  formatEventDate,
  formatEventRange,
  isSameCampusDay,
  parseCampusDateTime,
  toCampusInputValue,
} from "@/lib/format"

describe("bodyPreview", () => {
  it("returns short text unchanged", () => {
    expect(bodyPreview("hello world", 50)).toBe("hello world")
  })

  it("cuts on a word boundary and appends an ellipsis", () => {
    expect(bodyPreview("alpha beta gamma delta", 12)).toBe("alpha beta…")
  })
})

describe("campus day", () => {
  it("uses IST, not UTC, to decide the day", () => {
    const lateUtc = new Date("2026-09-27T20:00:00Z")
    expect(campusDayKey(lateUtc)).toBe("2026-09-28")
  })

  it("treats times either side of IST midnight as different days", () => {
    const before = new Date("2026-09-27T18:00:00Z")
    const after = new Date("2026-09-27T19:00:00Z")
    expect(isSameCampusDay(before, after)).toBe(false)
  })
})

describe("formatEventDate", () => {
  it("shows a time range for a same-day event", () => {
    const start = new Date("2026-10-01T05:30:00Z")
    const end = new Date("2026-10-01T08:00:00Z")
    expect(formatEventDate(start, end)).toContain("–")
    expect(formatEventDate(start, end)).not.toContain("→")
  })

  it("shows a day range for a multi-day event", () => {
    const start = new Date("2026-10-01T05:30:00Z")
    const end = new Date("2026-10-03T05:30:00Z")
    expect(formatEventDate(start, end)).toContain("→")
  })
})

describe("formatEventRange", () => {
  it("returns a single date for a same-day event", () => {
    const start = new Date("2026-10-01T05:30:00Z")
    const end = new Date("2026-10-01T08:00:00Z")
    expect(formatEventRange(start, end).date).not.toContain("–")
  })
})

describe("campus datetime inputs", () => {
  it("reads a datetime-local value as IST", () => {
    expect(parseCampusDateTime("2026-10-01T11:00")?.toISOString()).toBe(
      "2026-10-01T05:30:00.000Z"
    )
  })

  it("rejects malformed input", () => {
    expect(parseCampusDateTime("tomorrow")).toBeNull()
  })

  it("round-trips through the input format", () => {
    const date = new Date("2026-10-01T05:30:00Z")
    expect(parseCampusDateTime(toCampusInputValue(date))?.getTime()).toBe(
      date.getTime()
    )
  })
})

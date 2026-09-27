import { describe, expect, it } from "vitest"
import {
  bodyPreview,
  calendarDayKey,
  campusCalendarDate,
  campusDayKey,
  formatCalendarHeader,
  formatStamp,
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

describe("campus calendar dates", () => {
  it("maps a late-night UTC instant to the next IST calendar day", () => {
    const date = campusCalendarDate(new Date("2026-09-27T20:00:00Z"))
    expect(calendarDayKey(date)).toBe("2026-09-28")
  })

  it("keys a calendar date by its local day", () => {
    expect(calendarDayKey(new Date(2026, 0, 5))).toBe("2026-01-05")
  })
})

describe("deterministic formatting", () => {
  const start = new Date("2026-09-30T11:00:00Z")

  it("formats an IST short day and time", () => {
    expect(formatEventDate(start)).toBe("Wed, 30 Sept · 4:30 pm")
  })

  it("formats a same-day range", () => {
    const end = new Date("2026-09-30T13:30:00Z")
    expect(formatEventRange(start, end)).toEqual({
      date: "Wednesday, 30 September 2026",
      time: "4:30 pm–7:00 pm",
    })
  })

  it("formats midnight and noon in 12-hour time", () => {
    expect(formatStamp(new Date("2026-09-30T18:30:00Z"))).toBe(
      "1 Oct, 12:00 am"
    )
    expect(formatStamp(new Date("2026-09-30T06:30:00Z"))).toBe(
      "30 Sept, 12:00 pm"
    )
  })

  it("formats a calendar header from local date fields", () => {
    expect(formatCalendarHeader(new Date(2026, 8, 28))).toBe(
      "Monday, 28 September"
    )
  })
})

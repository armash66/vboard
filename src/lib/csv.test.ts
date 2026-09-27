import { describe, expect, it } from "vitest"
import { toCsv } from "@/lib/csv"

describe("toCsv", () => {
  it("joins rows with CRLF", () => {
    expect(toCsv(["a", "b"], [[1, 2]])).toBe("a,b\r\n1,2")
  })

  it("quotes commas and doubles quotes", () => {
    expect(toCsv(["x"], [['He said "hi", then left']])).toBe(
      'x\r\n"He said ""hi"", then left"'
    )
  })

  it("neutralises spreadsheet formulas", () => {
    expect(toCsv(["x"], [["=HYPERLINK(1)"]])).toBe("x\r\n'=HYPERLINK(1)")
  })

  it("renders empty values as blank cells", () => {
    expect(toCsv(["a", "b"], [[null, undefined]])).toBe("a,b\r\n,")
  })
})

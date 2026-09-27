function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  let text = value instanceof Date ? value.toISOString() : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n")
}

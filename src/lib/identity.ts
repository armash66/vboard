export const ALLOWED_EMAIL_DOMAIN = "vit.edu.in"

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isCollegeEmail(email: string): boolean {
  return normalizeEmail(email).endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)
}

export function parseEmailList(value: string | undefined): string[] {
  return (value ?? "").split(",").map(normalizeEmail).filter(Boolean)
}

export function deriveNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? ""
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ") || email
  )
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts
  return letters.map((p) => p.charAt(0).toUpperCase()).join("") || "?"
}

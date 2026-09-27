export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "")
}

export function uniqueSlug(input: string, suffix: string): string {
  const base = slugify(input) || "post"
  return `${base}-${suffix}`
}

export function randomSuffix(length = 5): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789"
  let out = ""
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

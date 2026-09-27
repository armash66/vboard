export function PageHeader({
  eyebrow,
  title,
  description,
  width = "42ch",
}: {
  eyebrow: string
  title: string
  description: string
  width?: string
}) {
  return (
    <header className="hairline-bottom space-y-5 pb-8">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="display-xl" style={{ color: "var(--text)" }}>
        {title}
      </h1>
      <p
        className="text-[1.05rem] leading-[1.55]"
        style={{ color: "var(--text-dim)", maxWidth: width }}
      >
        {description}
      </p>
    </header>
  )
}

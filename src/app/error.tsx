"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-6 text-center">
        <div className="eyebrow justify-center">Error</div>
        <h1 className="display-xl" style={{ color: "var(--text)" }}>
          Something went wrong.
        </h1>
        <p
          className="mx-auto max-w-[40ch] text-[1rem]"
          style={{ color: "var(--text-dim)" }}
        >
          An unexpected error occurred. Try again, and if the problem persists,
          report it on GitHub.
        </p>
        {error.digest && (
          <p
            className="font-mono text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Reference: {error.digest}
          </p>
        )}
        <div className="pt-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-5 py-3 font-mono text-[0.78rem] font-medium tracking-[0.06em] uppercase"
            style={{ background: "var(--text)", color: "var(--bg)" }}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}

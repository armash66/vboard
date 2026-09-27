"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function VossSignIn({ next }: { next: string }) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function signIn() {
    setError("")
    setLoading(true)
    const { error } = await authClient.signIn.oauth2({
      providerId: "voss",
      callbackURL: next,
      errorCallbackURL: "/login",
    })
    if (error) {
      setLoading(false)
      setError(error.message ?? "Could not reach VOSS. Try again in a moment.")
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <Button
        type="button"
        size="lg"
        onClick={signIn}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Redirecting to VOSS…" : "Continue with VOSS"}
        {!loading && <ArrowUpRight data-icon="inline-end" aria-hidden />}
      </Button>
    </div>
  )
}

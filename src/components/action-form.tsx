"use client"

import { useActionState, useEffect, useRef } from "react"
import { toast } from "sonner"
import type { ActionResult } from "@/lib/action-result"

type Action = (
  prev: ActionResult | null,
  formData: FormData
) => Promise<ActionResult>

export function ActionForm({
  action,
  children,
  className,
  onDone,
}: {
  action: Action
  children: React.ReactNode
  className?: string
  onDone?: () => void
}) {
  const [state, formAction] = useActionState(action, null)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    if (!state) return
    if (state.ok) {
      if (state.message) toast.success(state.message)
      onDoneRef.current?.()
    } else {
      toast.error(state.error)
    }
  }, [state])

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  )
}

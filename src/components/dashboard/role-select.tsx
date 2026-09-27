"use client"

import { useRef } from "react"
import { ActionForm } from "@/components/action-form"
import { FormSelect } from "@/components/form-select"
import type { ActionResult } from "@/lib/action-result"

export function AutoSubmitSelect({
  action,
  hidden,
  name,
  current,
  options,
  label,
}: {
  action: (
    prev: ActionResult | null,
    formData: FormData
  ) => Promise<ActionResult>
  hidden: Record<string, string>
  name: string
  current: string
  options: { value: string; label: string }[]
  label: string
}) {
  const anchor = useRef<HTMLSpanElement>(null)
  return (
    <ActionForm action={action}>
      <span ref={anchor}>
        {Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <FormSelect
          key={current}
          name={name}
          defaultValue={current}
          items={options}
          label={label}
          size="sm"
          className="w-36"
          onValueChange={() =>
            setTimeout(
              () => anchor.current?.closest("form")?.requestSubmit(),
              0
            )
          }
        />
      </span>
    </ActionForm>
  )
}

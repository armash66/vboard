"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function FormSelect({
  id,
  name,
  defaultValue,
  items,
  label,
  onValueChange,
  disabled,
  size,
  className,
}: {
  id?: string
  name: string
  defaultValue: string
  items: { value: string; label: string }[]
  label: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  size?: "sm" | "default"
  className?: string
}) {
  return (
    <Select
      name={name}
      defaultValue={defaultValue}
      items={items}
      disabled={disabled}
      onValueChange={(v) => onValueChange?.(String(v))}
    >
      <SelectTrigger
        id={id}
        aria-label={label}
        size={size}
        className={className ?? "w-full"}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

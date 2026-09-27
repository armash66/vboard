"use client"

import { useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"
import { ActionForm } from "@/components/action-form"
import { StatusBadge } from "@/components/dashboard/ui"
import { SubmitButton } from "@/components/submit-button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { decideRegistrationsAction } from "@/app/dashboard/c/[slug]/posts/actions"

export type RegistrationRow = {
  id: string
  name: string
  email: string
  rollNumber: string | null
  department: string | null
  status: string
  registeredAt: string
}

const FILTERS = [
  "all",
  "pending",
  "approved",
  "attended",
  "rejected",
  "cancelled",
]

export function RegistrationsTable({
  rows,
  slug,
  postId,
  canDecide,
  canCheckIn,
  initialFilter,
}: {
  rows: RegistrationRow[]
  slug: string
  postId: string
  canDecide: boolean
  canCheckIn: boolean
  initialFilter: string
}) {
  const [filter, setFilter] = useState(
    FILTERS.includes(initialFilter) ? initialFilter : "all"
  )
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length }
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1
    return c
  }, [rows])

  const visible = rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return [r.name, r.email, r.rollNumber ?? ""].some((v) =>
      v.toLowerCase().includes(q)
    )
  })

  const allSelected =
    visible.length > 0 && visible.every((r) => selected.has(r.id))
  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const selectable = canDecide || canCheckIn
  const none = selected.size === 0

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 border-b px-6 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={filter}
          onValueChange={(v) => {
            setFilter(String(v))
            setSelected(new Set())
          }}
        >
          <TabsList className="flex-wrap">
            {FILTERS.map((f) => (
              <TabsTrigger key={f} value={f} className="capitalize">
                {f}
                <span className="text-muted-foreground tabular-nums">
                  {counts[f] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full lg:w-64">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, email, roll no."
            aria-label="Search registrations"
            className="pl-8"
          />
        </div>
      </div>

      {selectable && (
        <ActionForm
          action={decideRegistrationsAction}
          onDone={() => setSelected(new Set())}
          className="bg-muted/40 flex flex-wrap items-center gap-2 border-b px-6 py-3"
        >
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="postId" value={postId} />
          {[...selected].map((id) => (
            <input key={id} type="hidden" name="registrationId" value={id} />
          ))}
          <span className="text-muted-foreground mr-2 text-sm tabular-nums">
            {selected.size} selected
          </span>
          {canDecide && (
            <>
              <SubmitButton
                name="decision"
                value="approve"
                size="sm"
                disabled={none}
              >
                Approve
              </SubmitButton>
              <SubmitButton
                name="decision"
                value="reject"
                size="sm"
                variant="destructive"
                disabled={none}
              >
                Reject
              </SubmitButton>
            </>
          )}
          {canCheckIn && (
            <>
              <SubmitButton
                name="decision"
                value="checkin"
                size="sm"
                variant="secondary"
                disabled={none}
              >
                Check in
              </SubmitButton>
              <SubmitButton
                name="decision"
                value="noshow"
                size="sm"
                variant="outline"
                disabled={none}
              >
                No-show
              </SubmitButton>
              <SubmitButton
                name="decision"
                value="reset"
                size="sm"
                variant="ghost"
                disabled={none}
              >
                Undo check-in
              </SubmitButton>
            </>
          )}
        </ActionForm>
      )}

      {visible.length === 0 ? (
        <p className="text-muted-foreground px-6 py-10 text-center text-sm">
          No registrations match.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-10 pl-6">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(on) =>
                      setSelected(
                        on ? new Set(visible.map((r) => r.id)) : new Set()
                      )
                    }
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead className={selectable ? "" : "pl-6"}>Name</TableHead>
              <TableHead>Roll no.</TableHead>
              <TableHead>Dept</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((r) => (
              <TableRow
                key={r.id}
                data-state={selected.has(r.id) ? "selected" : undefined}
              >
                {selectable && (
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={(on) => toggle(r.id, on)}
                      aria-label={`Select ${r.name}`}
                    />
                  </TableCell>
                )}
                <TableCell className={selectable ? "" : "pl-6"}>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-muted-foreground text-xs">{r.email}</div>
                </TableCell>
                <TableCell className="tabular-nums">
                  {r.rollNumber ?? "—"}
                </TableCell>
                <TableCell>{r.department ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {r.registeredAt}
                </TableCell>
                <TableCell className="pr-6">
                  <StatusBadge status={r.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

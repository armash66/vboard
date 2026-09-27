import { SearchIcon } from "lucide-react"
import { AutoSubmitSelect } from "@/components/dashboard/role-select"
import { PageHeader, Panel } from "@/components/dashboard/ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listPeople } from "@/db/queries/profiles"
import { parseEmailList } from "@/lib/identity"
import {
  canSetSiteRole,
  SITE_ROLE_LABEL,
  siteCan,
  type SiteRole,
} from "@/lib/rbac"
import { requireSiteCapability } from "@/lib/session"
import { setSiteRoleAction } from "../actions"

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const user = await requireSiteCapability("user:read")
  const { q = "" } = await searchParams
  const people = await listPeople(q)
  const superAdmins = parseEmailList(process.env.SUPER_ADMIN_EMAILS)
  const canManageAdmins = siteCan(user.siteRole, "admin:manage")

  return (
    <>
      <PageHeader
        title="People"
        description={
          canManageAdmins
            ? "Everyone who has signed in. Promote a student to admin or step an admin back down."
            : "Everyone who has signed in. Only the super admin can change site roles."
        }
      />
      <Panel
        title={q ? `Results for "${q}"` : "Everyone"}
        description={`${people.length}${people.length === 50 ? "+" : ""} people`}
        flush
        action={
          <form className="flex gap-2">
            <div className="relative">
              <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Name, email, roll no."
                aria-label="Search people"
                className="w-56 pl-8"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Roll no.</TableHead>
              <TableHead>Dept</TableHead>
              <TableHead className="pr-6">Site role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.map((p) => {
              const current: SiteRole = superAdmins.includes(
                p.email.toLowerCase()
              )
                ? "super_admin"
                : (p.siteRole ?? "student")
              const next: SiteRole = current === "admin" ? "student" : "admin"
              const editable =
                canManageAdmins &&
                canSetSiteRole(user.siteRole, {
                  current,
                  next,
                  isSelf: p.id === user.id,
                })
              return (
                <TableRow key={p.id}>
                  <TableCell className="pl-6">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {p.email}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {p.rollNumber ?? "—"}
                  </TableCell>
                  <TableCell>{p.department ?? "—"}</TableCell>
                  <TableCell className="pr-6">
                    {editable ? (
                      <AutoSubmitSelect
                        action={setSiteRoleAction}
                        hidden={{ userId: p.id }}
                        name="siteRole"
                        label={`Site role for ${p.name}`}
                        current={current}
                        options={[
                          { value: "student", label: "Student" },
                          { value: "admin", label: "Admin" },
                        ]}
                      />
                    ) : (
                      <Badge
                        variant={
                          current === "student" ? "secondary" : "default"
                        }
                      >
                        {SITE_ROLE_LABEL[current]}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Panel>
    </>
  )
}

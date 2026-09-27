import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { COMMUNITY_ROLE_LABEL, type CommunityRole } from "@/lib/rbac"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground max-w-2xl text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function SectionCards({ children }: { children: React.ReactNode }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  badge,
  footer,
  hint,
}: {
  label: string
  value: number | string
  badge?: React.ReactNode
  footer?: string
  hint?: string
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {badge && <CardAction>{badge}</CardAction>}
      </CardHeader>
      {(footer || hint) && (
        <CardFooter className="flex-col items-start gap-1 text-sm">
          {footer && <div className="line-clamp-1 font-medium">{footer}</div>}
          {hint && <div className="text-muted-foreground">{hint}</div>}
        </CardFooter>
      )}
    </Card>
  )
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  flush,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  flush?: boolean
}) {
  return (
    <Card className={cn(flush && "gap-0 pb-0", className)}>
      {(title || action) && (
        <CardHeader className={cn(flush && "border-b pb-4")}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      <CardContent className={cn(flush && "px-0")}>{children}</CardContent>
    </Card>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <div className="text-sm font-medium">{title}</div>
      {body && <p className="text-muted-foreground max-w-sm text-sm">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function RoleBadge({ role }: { role: CommunityRole | "admin" }) {
  const label = role === "admin" ? "Site admin" : COMMUNITY_ROLE_LABEL[role]
  return (
    <Badge
      variant={role === "lead" || role === "admin" ? "default" : "secondary"}
    >
      {label}
    </Badge>
  )
}

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  published: "default",
  approved: "default",
  attended: "default",
  active: "default",
  pending: "outline",
  draft: "secondary",
  cancelled: "secondary",
  completed: "secondary",
  no_show: "secondary",
  archived: "secondary",
  rejected: "destructive",
  hidden: "destructive",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "outline"} className="capitalize">
      {status.replace("_", " ")}
    </Badge>
  )
}

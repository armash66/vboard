import { desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { auditLog, user } from "@/db/schema"

export async function createAuditLog(entry: {
  actorId: string
  action: string
  targetType: string
  targetId?: string | null
  communityId?: string | null
  details?: Record<string, unknown>
}) {
  await db.insert(auditLog).values(entry)
}

export async function listAuditLog(limit = 100) {
  return db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      targetType: auditLog.targetType,
      targetId: auditLog.targetId,
      details: auditLog.details,
      createdAt: auditLog.createdAt,
      actorName: user.name,
      actorEmail: user.email,
    })
    .from(auditLog)
    .leftJoin(user, eq(user.id, auditLog.actorId))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
}

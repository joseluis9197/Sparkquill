import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers, auditLog } from "@/db/schema";
import type { AdminIdentity } from "./session";

/**
 * The record of what staff did.
 *
 * Every action that touches an account, a subscription or a child's data goes
 * through here. It is not paperwork: it is the first thing a school district
 * asks for in a privacy review, and the only way to answer "who changed this"
 * six months later.
 *
 * The actor's email is stored alongside the id on purpose. Ids become
 * meaningless once a staff account is deleted, and an audit trail that cannot
 * name the person is not an audit trail.
 */
export async function recordAudit(opts: {
  actor: AdminIdentity;
  action: string;
  targetType: "parent" | "student" | "subscription" | "admin" | "item";
  targetId: string;
  before?: unknown;
  after?: unknown;
}) {
  await db.insert(auditLog).values({
    actorId: opts.actor.id,
    actorEmail: opts.actor.email,
    action: opts.action,
    targetType: opts.targetType,
    targetId: opts.targetId,
    before: opts.before ?? null,
    after: opts.after ?? null,
  });
}

export async function recentAudit(limit = 100) {
  return db
    .select({
      id: auditLog.id,
      actorEmail: auditLog.actorEmail,
      action: auditLog.action,
      targetType: auditLog.targetType,
      targetId: auditLog.targetId,
      before: auditLog.before,
      after: auditLog.after,
      createdAt: auditLog.createdAt,
      actorName: adminUsers.name,
    })
    .from(auditLog)
    .leftJoin(adminUsers, eq(auditLog.actorId, adminUsers.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}

/** Human phrasing for the log view. */
export const ACTION_LABEL: Record<string, string> = {
  "admin.signed_in": "Signed in",
  "student.pin_reset": "Reset a PIN",
  "student.grade_changed": "Changed a grade",
  "student.deleted": "Deleted a child and their history",
  "parent.data_exported": "Exported a family's data",
  "subscription.seats_changed": "Changed the number of seats",
  "parent.complimentary_granted": "Granted free access",
  "parent.complimentary_revoked": "Ended free access",
};

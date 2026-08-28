import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";

/**
 * Staff sessions.
 *
 * Deliberately its own mechanism rather than a role flag on a parent account.
 * An admin cookie and a parent cookie are different names, different secrets
 * and different lifetimes, so a bug in one cannot escalate into the other, and
 * nobody can be quietly promoted by writing a column.
 *
 * Eight hours, because staff access to families' data should not sit open on a
 * laptop for a month the way an ordinary login can.
 */

const COOKIE = "sq_admin";
const MAX_AGE_SECONDS = 8 * 60 * 60;

export type AdminRole = "support" | "content" | "owner";

export interface AdminIdentity {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
}

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  // A distinct derivation, so an admin cookie can never be mistaken for, or
  // forged from, any other signed value in the app.
  return `admin:${s}`;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function isValid(value: string, signature: string): boolean {
  const expected = Buffer.from(sign(value));
  const given = Buffer.from(signature);
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

export async function startAdminSession(adminId: string) {
  const jar = await cookies();
  const payload = `${adminId}.${Date.now() + MAX_AGE_SECONDS * 1000}`;
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "strict", // stricter than the parent session: no cross-site use
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/**
 * The signed-in staff member, or null.
 *
 * Re-reads the row every time rather than trusting the cookie's contents: an
 * account deactivated ten seconds ago must stop working immediately, not when
 * the cookie happens to expire.
 */
export async function currentAdmin(): Promise<AdminIdentity | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;

  const lastDot = raw.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const payload = raw.slice(0, lastDot);
  const signature = raw.slice(lastDot + 1);
  if (!isValid(payload, signature)) return null;

  const [adminId, expiresAt] = payload.split(".");
  if (!adminId || !expiresAt) return null;
  if (Number(expiresAt) < Date.now()) return null;

  const [row] = await db
    .select()
    .from(adminUsers)
    .where(and(eq(adminUsers.id, adminId), eq(adminUsers.active, true)))
    .limit(1);

  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as AdminRole,
  };
}

/** Ranking used for permission checks. */
const RANK: Record<AdminRole, number> = { support: 1, content: 2, owner: 3 };

export function atLeast(role: AdminRole, required: AdminRole): boolean {
  return RANK[role] >= RANK[required];
}

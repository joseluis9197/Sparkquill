import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Which child is currently using the app.
 *
 * Deliberately separate from the parent's session. The parent is
 * authenticated; the child is *selected*, after entering their PIN, from
 * within that authenticated session. A child never holds credentials of their
 * own, which is the whole point of the account model.
 *
 * The cookie is signed rather than encrypted: it carries a student id and
 * nothing else, and the id is meaningless without the parent session that
 * scopes it. Every read still verifies the student belongs to the signed-in
 * parent, so a forged cookie buys nothing even if the signature were broken.
 */

const COOKIE = "sq_student";
const MAX_AGE_SECONDS = 60 * 60 * 12; // a school day, not a month

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function isValid(value: string, signature: string): boolean {
  const expected = Buffer.from(sign(value));
  const given = Buffer.from(signature);
  // Lengths must match before timingSafeEqual, which throws otherwise.
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

export async function setActiveStudent(studentId: string) {
  const jar = await cookies();
  jar.set(COOKIE, `${studentId}.${sign(studentId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getActiveStudentId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;

  const separator = raw.lastIndexOf(".");
  if (separator <= 0) return null;

  const id = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);
  return isValid(id, signature) ? id : null;
}

export async function clearActiveStudent() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

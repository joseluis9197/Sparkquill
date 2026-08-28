import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/db";
import { parents } from "@/db/schema";

/**
 * Parent authentication.
 *
 * Only parents have accounts. Children are profiles underneath a parent, with
 * a first name and a PIN and no email address of their own — that shape is
 * what keeps the COPPA position defensible, and it is why there is no
 * "student" provider here and never should be.
 *
 * JWT sessions rather than database sessions: without an adapter there is one
 * fewer moving part, and a parent session carries nothing beyond an id.
 */

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const [parent] = await db
          .select()
          .from(parents)
          .where(eq(parents.email, parsed.data.email.toLowerCase()))
          .limit(1);

        // Compare against a dummy hash when the account does not exist, so a
        // wrong email and a wrong password take the same time to reject and
        // the response cannot be used to enumerate registered addresses.
        const hash =
          parent?.passwordHash ??
          "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
        const ok = await bcrypt.compare(parsed.data.password, hash);

        if (!parent || !ok) return null;

        return {
          id: parent.id,
          email: parent.email,
          name: parent.name ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

/** Cost factor for parent passwords. 12 is the current sensible default. */
export const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * PINs are four digits, so the keyspace is only 10,000. A slower hash is the
 * only thing standing between that and instant offline cracking, and the cost
 * is paid once per child sign-in rather than per request.
 */
export function hashPin(pin: string) {
  return bcrypt.hash(pin, BCRYPT_ROUNDS);
}

export function verifyPin(pin: string, hash: string) {
  return bcrypt.compare(pin, hash);
}

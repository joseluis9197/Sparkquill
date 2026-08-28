import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getActiveStudentId } from "@/lib/student-session";
import { switchStudent } from "@/app/actions/accounts";

/**
 * Global header.
 *
 * Shows three different things depending on who is at the keyboard: a visitor,
 * a signed-in parent, or a child mid-session. A child should not be offered
 * "Sign out" — that is their parent's account, and them signing out of it is
 * a support call waiting to happen.
 */
export default async function SiteHeader() {
  const session = await auth();
  const activeStudent = await getActiveStudentId();
  const signedIn = Boolean(session?.user?.id);

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
        <Link
          href={signedIn ? "/students" : "/"}
          className="compact flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
        >
          <span aria-hidden className="text-xl">
            🪶
          </span>
          Sparkquill
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {!signedIn && (
            <>
              <NavLink href="/curriculum">What&rsquo;s covered</NavLink>
              <NavLink href="/login">Sign in</NavLink>
              <Link
                href="/signup"
                className="ml-1 inline-flex items-center rounded-full bg-[var(--brand)] px-5 text-sm font-bold text-[var(--brand-contrast)] leading-[40px]"
              >
                Start free
              </Link>
            </>
          )}

          {signedIn && activeStudent && (
            // A child is using the app: give them the way back to the profile
            // picker, and nothing that touches the parent's account.
            <form action={switchStudent}>
              <button
                type="submit"
                className="compact rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-2)]"
              >
                Switch profile
              </button>
            </form>
          )}

          {signedIn && !activeStudent && (
            <>
              <NavLink href="/students">Profiles</NavLink>
              <NavLink href="/parent">Dashboard</NavLink>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="compact rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-2)]"
                >
                  Sign out
                </button>
              </form>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="compact rounded-full px-3 py-2 font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
    >
      {children}
    </Link>
  );
}

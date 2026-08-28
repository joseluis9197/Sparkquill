import type { Metadata } from "next";
import Link from "next/link";
import { currentAdmin } from "@/lib/admin/session";
import { adminSignOut } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Sparkquill admin" },
  // Staff tooling has no business in a search index.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Admin shell.
 *
 * The guard here is convenience, not the defence: every page and every action
 * checks for itself. A layout that is the only thing standing between a
 * stranger and every family's data is one routing change away from being
 * bypassed.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await currentAdmin();

  return (
    <div className="min-h-dvh bg-[var(--surface-2)]">
      {admin && (
        <div className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
            <nav className="flex items-center gap-1 text-sm">
              <Tab href="/admin">Overview</Tab>
              <Tab href="/admin/accounts">Accounts</Tab>
              <Tab href="/admin/items">Item health</Tab>
              <Tab href="/admin/audit">Audit</Tab>
            </nav>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[var(--text-muted)]">
                {admin.email}
                <span className="ml-2 rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-xs font-semibold">
                  {admin.role}
                </span>
              </span>
              <form action={adminSignOut}>
                <button
                  type="submit"
                  className="compact rounded-full border border-[var(--border)] px-4 py-1.5 text-sm font-semibold transition hover:bg-[var(--surface-2)]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function Tab({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="compact rounded-full px-3 py-2 font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
    >
      {children}
    </Link>
  );
}

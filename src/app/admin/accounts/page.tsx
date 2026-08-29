import { redirect } from "next/navigation";
import Link from "next/link";
import { currentAdmin } from "@/lib/admin/session";
import { searchAccounts } from "@/lib/data/admin-queries";

const DATE = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function AccountsPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");

  const { q } = await props.searchParams;
  const results = await searchAccounts(q ?? "");

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-3xl">Accounts</h1>

      <form className="mt-5 flex max-w-md gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Parent email, parent name, or a child's name"
          className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm focus:border-[var(--brand)]"
        />
        <button
          type="submit"
          className="compact rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-[var(--brand-contrast)]"
        >
          Search
        </button>
      </form>

      <p className="mt-4 text-sm text-[var(--text-muted)]">
        {results.length === 0
          ? q
            ? "Nothing matched."
            : "No accounts yet."
          : `${results.length} ${results.length === 1 ? "account" : "accounts"}`}
      </p>

      {results.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-2.5 font-bold">Parent</th>
                <th className="px-4 py-2.5 font-bold">Children</th>
                <th className="px-4 py-2.5 font-bold">Subscription</th>
                <th className="px-4 py-2.5 font-bold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr
                  key={r.parentId}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/accounts/${r.parentId}`}
                      className="font-semibold text-[var(--brand)]"
                    >
                      {r.email}
                    </Link>
                    {r.name && (
                      <span className="block text-xs text-[var(--text-muted)]">
                        {r.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.childCount}</td>
                  <td className="px-4 py-3">
                    {r.status ? (
                      <span className="rounded-full bg-[var(--surface-3)] px-2.5 py-1 text-xs font-semibold">
                        {r.status}
                        {r.seatQuantity ? ` · ${r.seatQuantity} seats` : ""}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">none</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {DATE.format(new Date(r.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

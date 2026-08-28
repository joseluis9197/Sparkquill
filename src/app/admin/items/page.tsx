import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin/session";
import { itemHealth } from "@/lib/data/admin-queries";
import { GENERATORS } from "@/lib/items/registry";

/**
 * How the question bank is behaving with real children.
 *
 * p-value is the share answered correctly. Very low usually means the item is
 * broken or the wording is impenetrable rather than that children are weak;
 * very high means it is teaching nothing. Both are flagged, because a wall of
 * numbers with nothing pointed at is a report nobody reads.
 */
export default async function ItemHealthPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");

  const health = await itemHealth(5);
  const byKey = new Map(health.map((h) => [h.templateKey, h]));

  const rows = GENERATORS.map((g) => ({
    key: g.key,
    benchmark: g.benchmark,
    skill: g.skillSlug,
    stats: byKey.get(g.key) ?? null,
  }));

  const flagged = rows.filter(
    (r) => r.stats && (r.stats.pValue < 0.2 || r.stats.pValue > 0.95),
  );

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-3xl">Item health</h1>
      <p className="mt-2 max-w-prose text-sm text-[var(--text-muted)]">
        {GENERATORS.length} generators. Statistics appear once a generator has
        been answered at least five times; below that the numbers say more about
        the sample than the item.
      </p>

      {flagged.length > 0 && (
        <div className="mt-6 rounded-[var(--radius-card)] border-l-4 border-[var(--accent)] bg-[var(--surface)] px-5 py-4">
          <p className="text-sm font-bold">Worth a look</p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
            {flagged.map((r) => (
              <li key={r.key}>
                <span className="font-mono">{r.key}</span> —{" "}
                {r.stats!.pValue < 0.2
                  ? `only ${Math.round(r.stats!.pValue * 100)}% correct, which usually means the item is broken rather than hard`
                  : `${Math.round(r.stats!.pValue * 100)}% correct, so it is teaching nothing`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-2.5 font-bold">Generator</th>
              <th className="px-4 py-2.5 font-bold">Benchmark</th>
              <th className="px-4 py-2.5 font-bold">Answered</th>
              <th className="px-4 py-2.5 font-bold">Correct</th>
              <th className="px-4 py-2.5 font-bold">Median time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const p = r.stats?.pValue;
              const off = p !== undefined && (p < 0.2 || p > 0.95);
              return (
                <tr
                  key={r.key}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <td className="px-4 py-2.5 font-mono text-xs">{r.key}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-muted)]">
                    {r.benchmark}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">
                    {r.stats?.attempts ?? (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-2.5 tabular-nums ${
                      off ? "font-bold text-[var(--color-ember-500)]" : ""
                    }`}
                  >
                    {p === undefined ? (
                      <span className="text-[var(--text-muted)]">—</span>
                    ) : (
                      `${Math.round(p * 100)}%`
                    )}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-[var(--text-muted)]">
                    {r.stats
                      ? `${(r.stats.meanTimeMs / 1000).toFixed(1)}s`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

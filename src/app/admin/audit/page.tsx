import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin/session";
import { ACTION_LABEL, recentAudit } from "@/lib/admin/audit";

const WHEN = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AuditPage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");

  const entries = await recentAudit(200);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-3xl">Audit log</h1>
      <p className="mt-2 max-w-prose text-sm text-[var(--text-muted)]">
        Every staff action that touches an account, a subscription or a
        child&rsquo;s data. Append-only, and the first thing a school district
        asks to see.
      </p>

      {entries.length === 0 ? (
        <p className="mt-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--text-muted)]">
          Nothing logged yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-2.5 font-bold">When</th>
                <th className="px-4 py-2.5 font-bold">Who</th>
                <th className="px-4 py-2.5 font-bold">Did what</th>
                <th className="px-4 py-2.5 font-bold">To</th>
                <th className="px-4 py-2.5 font-bold">Change</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-[var(--border)] last:border-b-0">
                  <td className="whitespace-nowrap px-4 py-2.5 text-[var(--text-muted)]">
                    {WHEN.format(new Date(e.createdAt))}
                  </td>
                  <td className="px-4 py-2.5">{e.actorEmail}</td>
                  <td className="px-4 py-2.5">
                    {ACTION_LABEL[e.action] ?? e.action}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-muted)]">
                    {e.targetType} {e.targetId.slice(0, 8)}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-muted)]">
                    {e.before || e.after
                      ? `${e.before ? JSON.stringify(e.before) : ""}${
                          e.before && e.after ? " -> " : ""
                        }${e.after ? JSON.stringify(e.after) : ""}`.slice(0, 70)
                      : ""}
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

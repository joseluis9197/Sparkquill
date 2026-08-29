import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { currentAdmin } from "@/lib/admin/session";
import { familyDetail, studentAttempts } from "@/lib/data/admin-queries";
import { ordinal } from "@/lib/utils";
import StudentTools from "./StudentTools";
import SeatTool from "./SeatTool";
import ComplimentaryTool from "./ComplimentaryTool";

const WHEN = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function FamilyPage(props: {
  params: Promise<{ id: string }>;
}) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await props.params;
  const family = await familyDetail(id);
  if (!family) notFound();

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link
        href="/admin/accounts"
        className="text-sm font-semibold text-[var(--brand)]"
      >
        &larr; Accounts
      </Link>

      <h1 className="mt-3 text-3xl">{family.parent.email}</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        {family.parent.name ?? "No name given"} · joined{" "}
        {WHEN.format(new Date(family.parent.createdAt))}
      </p>

      {/* Subscription */}
      <section className="mt-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg">Subscription</h2>
        {family.subscription ? (
          <>
            <dl className="mt-3 grid gap-3 sm:grid-cols-4">
              <Detail label="Status" value={family.subscription.status} />
              <Detail
                label="Seats paid"
                value={String(family.subscription.seatQuantity)}
              />
              <Detail
                label="Seats used"
                value={String(family.children.filter((c) => c.hasSeat).length)}
              />
              <Detail
                label={
                  family.subscription.cancelAtPeriodEnd ? "Ends" : "Renews"
                }
                value={
                  family.subscription.currentPeriodEnd
                    ? WHEN.format(new Date(family.subscription.currentPeriodEnd))
                    : "—"
                }
              />
            </dl>
            <p className="mt-3 font-mono text-xs text-[var(--text-muted)]">
              {family.subscription.stripeSubscriptionId}
            </p>
            {admin.role === "owner" && (
              <SeatTool
                parentId={family.parent.id}
                current={family.subscription.seatQuantity}
              />
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            No subscription.
          </p>
        )}

        {admin.role === "owner" && (
          <ComplimentaryTool
            parentId={family.parent.id}
            until={family.parent.complimentaryUntil}
            reason={family.parent.complimentaryReason}
            active={family.complimentaryActive}
          />
        )}
      </section>

      {/* Children */}
      {family.children.length === 0 && (
        <p className="mt-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-muted)]">
          No children on this account.
        </p>
      )}

      {family.children.map(async (child) => {
        const recent = await studentAttempts(child.student.id, 12);
        const accuracy =
          child.attemptCount === 0
            ? null
            : Math.round((child.correctCount / child.attemptCount) * 100);

        return (
          <section
            key={child.student.id}
            className="mt-6 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl">{child.student.firstName}</h2>
              <span className="text-xs text-[var(--text-muted)]">
                {ordinal(child.student.grade)} grade ·{" "}
                {child.hasSeat ? "has a seat" : "no seat"}
              </span>
            </div>

            <dl className="mt-3 grid gap-3 sm:grid-cols-4">
              <Detail label="Answered" value={String(child.attemptCount)} />
              <Detail label="Correct" value={accuracy === null ? "—" : `${accuracy}%`} />
              <Detail label="Mastered" value={String(child.mastered)} />
              <Detail
                label="Last practised"
                value={
                  child.lastSeen ? WHEN.format(new Date(child.lastSeen)) : "never"
                }
              />
            </dl>

            <StudentTools
              studentId={child.student.id}
              firstName={child.student.firstName}
              grade={child.student.grade}
              canDelete={admin.role === "owner"}
            />

            {/* What the child actually saw. Answers "my daughter says the
                question was wrong" without guessing. */}
            {recent.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--brand)]">
                  Last {recent.length} questions
                </summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <tbody>
                      {recent.map((a) => (
                        <tr key={a.id} className="border-b border-[var(--border)] last:border-b-0">
                          <td className="py-1.5 pr-3 whitespace-nowrap text-[var(--text-muted)]">
                            {WHEN.format(new Date(a.createdAt))}
                          </td>
                          <td className="py-1.5 pr-3">{a.skillTitle}</td>
                          <td className="py-1.5 pr-3 font-mono text-[var(--text-muted)]">
                            {a.benchmarkCode}
                          </td>
                          <td className="py-1.5 pr-3">
                            <span
                              className={
                                a.correct
                                  ? "text-[var(--color-grow-500)]"
                                  : "text-[var(--color-ember-500)]"
                              }
                            >
                              {a.correct ? "correct" : "wrong"}
                            </span>
                          </td>
                          <td className="py-1.5 pr-3 text-[var(--text-muted)]">
                            {a.misconception ?? ""}
                          </td>
                          <td className="py-1.5 font-mono text-[10px] text-[var(--text-muted)]">
                            {a.templateKey}#{a.seed}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                    The template and seed reproduce the exact question the child
                    saw, byte for byte.
                  </p>
                </div>
              </details>
            )}
          </section>
        );
      })}
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-tile)] bg-[var(--surface-2)] px-3 py-2">
      <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

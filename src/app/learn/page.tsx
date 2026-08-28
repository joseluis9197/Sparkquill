import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireActiveStudent } from "@/lib/data/students";
import { nextQuestion } from "@/app/actions/practice";
import { ordinal } from "@/lib/utils";
import LearnSession from "./LearnSession";

export const metadata: Metadata = { title: "Practice" };

export default async function LearnPage() {
  const active = await requireActiveStudent();
  if (!active) redirect("/students");

  // The first question is rendered on the server so the child sees a question
  // immediately rather than a spinner.
  const first = await nextQuestion([]);

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--brand)]">
          {active.student.firstName} · {ordinal(active.student.grade)} grade ·
          Mathematics
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Let&rsquo;s practise</h1>
      </header>

      <LearnSession
        firstQuestion={first}
        studentName={active.student.firstName}
        audio={active.student.autoplayAudio}
      />
    </main>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { listStudents } from "@/lib/data/students";
import StudentPicker from "./StudentPicker";

export const metadata: Metadata = { title: "Who is practising?" };

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const children = await listStudents(session.user.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">
        {children.length === 0 ? "Add your first child" : "Who is practising?"}
      </h1>

      <div className="mt-10">
        <StudentPicker students={children} />
      </div>

      <p className="mt-12 text-center text-sm">
        <Link href="/parent" className="font-semibold text-[var(--brand)]">
          Parent dashboard
        </Link>
      </p>
    </main>
  );
}

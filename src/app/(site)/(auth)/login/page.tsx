import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logIn } from "@/app/actions/accounts";
import AuthForm from "../AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: {
  searchParams: Promise<{ reset?: string }>;
}) {
  if (await auth()) redirect("/students");
  const { reset } = await props.searchParams;

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl">Welcome back</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        Sign in to see how your children are getting on.
      </p>

      {reset === "done" && (
        <p className="mt-6 rounded-[var(--radius-tile)] border-l-4 border-[var(--color-grow-500)] bg-[var(--color-grow-100)] px-4 py-3 text-sm text-[var(--color-ink-900)]">
          Your password has been changed. Sign in with the new one.
        </p>
      )}
      <div className="mt-8">
        <AuthForm action={logIn} mode="login" />
      </div>
    </main>
  );
}

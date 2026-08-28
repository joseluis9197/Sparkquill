import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logIn } from "@/app/actions/accounts";
import AuthForm from "../AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await auth()) redirect("/students");

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl">Welcome back</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        Sign in to see how your children are getting on.
      </p>
      <div className="mt-8">
        <AuthForm action={logIn} mode="login" />
      </div>
    </main>
  );
}

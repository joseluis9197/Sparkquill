import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { signUp } from "@/app/actions/accounts";
import AuthForm from "../AuthForm";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage() {
  if (await auth()) redirect("/students");

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl">Create your account</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        You sign in; your children get their own profiles underneath, with a
        first name and a four-digit PIN. We never ask for a child&rsquo;s email
        address, surname or date of birth.
      </p>
      <div className="mt-8">
        <AuthForm action={signUp} mode="signup" />
      </div>
    </main>
  );
}

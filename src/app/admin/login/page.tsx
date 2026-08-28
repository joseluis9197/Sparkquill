import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin/session";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await currentAdmin()) redirect("/admin");

  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="text-2xl">Sparkquill admin</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Staff access to family accounts. Every action here is logged.
      </p>
      <div className="mt-8">
        <AdminLoginForm />
      </div>
    </main>
  );
}

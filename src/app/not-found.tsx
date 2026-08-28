import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <span className="text-5xl" aria-hidden>
        🧭
      </span>
      <h1 className="mt-4 text-3xl">That page isn&rsquo;t here</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        The link may be old, or the address may have a typo in it.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-[var(--brand)] px-8 text-base font-bold text-[var(--brand-contrast)] leading-[48px]"
      >
        Go to the start
      </Link>
    </main>
  );
}

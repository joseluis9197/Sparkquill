import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--surface-2)]">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/curriculum" className="text-[var(--text-muted)] hover:text-[var(--text)]">
            What&rsquo;s covered
          </Link>
          <Link href="/privacy" className="text-[var(--text-muted)] hover:text-[var(--text)]">
            Privacy &amp; children&rsquo;s data
          </Link>
          <Link href="/terms" className="text-[var(--text-muted)] hover:text-[var(--text)]">
            Terms
          </Link>
        </div>

        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-[var(--text-muted)]">
          Sparkquill is an independent study tool. It is not affiliated with,
          sponsored by, or endorsed by the Florida Department of Education or
          Cambium Assessment. &ldquo;FAST&rdquo; and &ldquo;B.E.S.T.&rdquo; are
          designations of the State of Florida and are used here only to
          describe what this tool helps students prepare for.
        </p>
      </div>
    </footer>
  );
}

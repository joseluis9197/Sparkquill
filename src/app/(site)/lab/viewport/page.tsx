import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viewport lab",
  robots: { index: false, follow: false },
};

const WIDTHS = [320, 360, 390, 414, 768];

const PAGES = [
  "/practice?grade=6&subject=math",
  "/practice?grade=5&subject=ela",
  "/lab/formats",
  "/lab/widgets",
  "/",
  "/curriculum",
  "/login",
];

/**
 * Every page at every phone width, side by side.
 *
 * An iframe gets its own viewport, so media queries inside it respond to the
 * frame's width rather than the window's. That makes this a real exercise of
 * the narrow layouts rather than a scaled-down screenshot, and it can be
 * checked without a phone in hand.
 *
 * 320 is the narrowest width still worth supporting — a first-generation
 * iPhone SE, and the floor most component libraries assume. A layout that
 * survives 320 survives everything above it.
 *
 * The app sends X-Frame-Options: DENY, which is right for the outside world
 * and would block this page too. Framing our own origin is allowed, because
 * clickjacking requires a *different* site to do the framing.
 */
export default async function ViewportLabPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await props.searchParams;
  const raw = params.w;
  const chosen = Number(Array.isArray(raw) ? raw[0] : raw);
  const width = WIDTHS.includes(chosen) ? chosen : 390;

  return (
    <main className="px-5 py-10">
      <h1 className="text-3xl">Viewport lab</h1>
      <p className="mt-2 text-[var(--text-muted)]">
        Each frame has its own viewport, so the narrow layouts are really
        exercised rather than scaled down.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {WIDTHS.map((w) => (
          <a
            key={w}
            href={`/lab/viewport?w=${w}`}
            className={
              w === width
                ? "rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-bold text-[var(--brand-contrast)]"
                : "rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--surface-2)]"
            }
          >
            {w}px
          </a>
        ))}
      </div>

      <div className="mt-8 flex gap-6 overflow-x-auto pb-6">
        {PAGES.map((path) => (
          <figure key={path} className="flex-none">
            <figcaption className="mb-2 font-mono text-xs text-[var(--text-muted)]">
              {path}
            </figcaption>
            <iframe
              src={path}
              title={path}
              width={width}
              height={720}
              className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
            />
          </figure>
        ))}
      </div>
    </main>
  );
}

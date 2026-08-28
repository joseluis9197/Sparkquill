import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/**
 * Chrome for everything a family sees.
 *
 * Separate from the root layout so the admin panel does not inherit it. Staff
 * were being shown the parent navigation, including a "Sign out" that ends the
 * *parent* session rather than the admin one — a confusing control to hand a
 * support person who is looking at someone else's account.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Skip link first, so a keyboard user is not made to tab through the
          whole header on every page. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--brand)] focus:px-5 focus:py-3 focus:font-bold focus:text-[var(--brand-contrast)]"
      >
        Skip to content
      </a>
      <SiteHeader />
      <div id="main" className="flex-1">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}

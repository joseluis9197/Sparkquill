import { NextResponse, type NextRequest } from "next/server";

/**
 * Content Security Policy.
 *
 * The note this replaces said a CSP written without measuring what the app
 * loads either breaks something or protects nothing. So it was measured
 * first, and the answer turned out to be simple: this app loads nothing from
 * anywhere else. `next/font` downloads the typefaces at build time and serves
 * them from our own origin, checkout is a server-side redirect rather than
 * embedded Stripe.js, and the 3D geometry is bundled. No external script, no
 * external stylesheet, no external font.
 *
 * That makes a genuinely strict policy possible rather than the usual
 * compromise, and the one thing worth being strict about is scripts. This is
 * a site where children sign in with a PIN and parents enter card details on
 * a page we hand off from; an injected script is the attack that matters.
 *
 * ## Why a nonce, and why per request
 *
 * Next inlines a bootstrap script into every page. Allowing it with
 * `'unsafe-inline'` would allow every other inline script too, which is the
 * whole attack. So each response gets a fresh random nonce, Next stamps it
 * onto its own scripts, and the policy trusts only that.
 *
 * `'strict-dynamic'` lets the trusted bootstrap load the chunks it needs
 * without the policy having to enumerate them. `'self'` and `https:` are kept
 * alongside it for browsers that do not understand `'strict-dynamic'`; those
 * browsers ignore the parts they do not know, and would otherwise be left
 * with a policy that blocks everything.
 *
 * ## Where it is deliberately not strict
 *
 * `style-src` allows inline styles. React sets element style attributes for
 * every progress bar, widget dimension and animated width in this codebase,
 * and there is no nonce mechanism for a style attribute. Injected CSS is a
 * far weaker vector than injected script — it can reskin a page, not exfiltrate
 * a session — and buying `script-src` strictness at the price of rewriting
 * every inline style would be a poor trade.
 *
 * ## Development
 *
 * Turbopack's hot reload needs `'unsafe-eval'` and a websocket. Both are
 * granted in development only. A policy that makes the dev server unusable
 * gets switched off by the first person it inconveniences, and then it is not
 * protecting production either.
 */

const isDev = process.env.NODE_ENV === "development";

/**
 * Set CSP_REPORT_ONLY=1 to observe violations without blocking anything.
 * Useful when adding a third-party script: run report-only, watch the
 * console, then widen the policy deliberately rather than by trial and error
 * against a broken page.
 */
const reportOnly = process.env.CSP_REPORT_ONLY === "1";

function policy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // data: for the emoji and inline SVG the widgets produce; blob: for
    // anything generated client-side.
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    // Forms post to our own origin only. Stripe checkout is a redirect, not a
    // cross-origin form post, so this does not need widening for payment.
    "form-action 'self'",
    // Matches X-Frame-Options above: same-origin framing in development for
    // the viewport lab, nothing at all in production.
    `frame-ancestors ${isDev ? "'self'" : "'none'"}`,
    // frame-ancestors governs who may frame us; frame-src governs what we may
    // frame. Both are needed for the viewport lab, and both stay shut in
    // production, where this app embeds nothing.
    `frame-src ${isDev ? "'self'" : "'none'"}`,
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");

  // Next reads the nonce from the request headers it receives, and stamps it
  // onto the scripts it renders. Setting it on the response alone would leave
  // its own bootstrap unnonced and therefore blocked.
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set(
    reportOnly
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy",
    policy(nonce),
  );
  return response;
}

export const config = {
  /*
   * Skipped for static assets and images, which carry no scripts and are the
   * bulk of requests. Prerendered pages are excluded too: they are generated
   * at build time and cannot carry a per-request nonce, so running this over
   * them would emit a policy whose nonce matches nothing.
   */
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|audio|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

import "server-only";

/**
 * Picks where a visitor's run through the no-account demo starts.
 *
 * This is one line of arithmetic in its own file for a reason. The demo is
 * server-rendered and then hydrated, so the starting seed has to be decided
 * once, on the server, and handed to the browser: choosing it during the
 * client render would produce different markup from the one already sent, and
 * React would discard the whole tree and render again.
 *
 * The obvious alternatives are both worse. A constant keeps the two sides in
 * step and gives every visitor the same first question for ever, which was
 * the behaviour here until the reading library grew large enough for it to be
 * an obvious waste. Calling Math.random() inline in the page is impure during
 * render, which React's compiler rejects and is right to: a render that is
 * not a function of its inputs cannot be re-run safely.
 *
 * An async call is where per-request work belongs, and it is the shape that
 * says so.
 */
export async function demoSeed(): Promise<number> {
  return 1 + Math.floor(Math.random() * 10_000);
}

/**
 * The base URL this deployment is reachable at.
 *
 * Every link this product emails — password resets, email confirmations,
 * Stripe return URLs — is built from here. It had been copy-pasted into three
 * action files, which is exactly the kind of duplication that ends with one
 * of them still pointing at localhost in production.
 */
export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

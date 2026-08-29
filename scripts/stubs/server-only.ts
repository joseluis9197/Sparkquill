/**
 * A stand-in for the `server-only` package.
 *
 * `server-only` is not a real dependency: the Next bundler resolves it itself,
 * and its whole job is to fail the build if a module reaches the browser.
 * Verification scripts import the very same modules the app runs, so Node has
 * to resolve it to something — and in a CLI process there is no browser to
 * keep the module away from, so an empty module is the honest equivalent.
 *
 * Wired up in tsconfig.scripts.json, so the app's own resolution is untouched
 * and the real guard still applies everywhere it matters.
 */
export {};

"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** Server render assumes motion is allowed, matching the CSS default. */
function getServerSnapshot() {
  return false;
}

/**
 * Reads the OS-level reduced-motion preference.
 *
 * useSyncExternalStore rather than useEffect + setState: the preference is
 * external state that already exists at first paint, so subscribing to it is
 * the honest description of what is happening, and it avoids the extra render
 * pass that setting state inside an effect would cause on every widget mount.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

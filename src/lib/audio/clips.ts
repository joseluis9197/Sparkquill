import { createHash } from "node:crypto";

/**
 * Where a passage's narration clip lives, if one has been built.
 *
 * Named by the hash of the text rather than the passage id, so editing a
 * passage yields a new filename instead of a stale clip that no longer
 * matches the words on screen. A child hearing one sentence while reading
 * another is worse than a child hearing the device's own voice.
 *
 * This only produces the path. Whether a file is actually there is decided in
 * the browser, which falls back to synthesis when the request fails — a check
 * on the server would cost a filesystem stat on every question for a
 * guarantee the client has to make anyway.
 */
export function passageClipUrl(text: string): string {
  const hash = createHash("sha256").update(text).digest("hex").slice(0, 16);
  return `/audio/passages/${hash}.mp3`;
}

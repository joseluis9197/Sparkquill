import "server-only";
import { createHash } from "node:crypto";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Where a passage's narration clip lives, when one has actually been built.
 *
 * Named by the hash of the text rather than the passage id, so editing a
 * passage yields a new filename instead of a stale clip that no longer
 * matches the words on screen. A child hearing one sentence while reading
 * another is worse than a child hearing the device's own voice.
 *
 * ## Why this now checks
 *
 * It used to return a path unconditionally and leave the browser to discover
 * that no file was there. That reasoning was sound and the consequence was
 * not: no clips have ever been built, so every passage pointed at a URL that
 * 404s, and the player waited on it. The read-aloud button on a passage —
 * the one affordance a child who cannot read the text depends on — did
 * nothing at all, for as long as the feature has existed.
 *
 * The stat-per-question that was being avoided is avoided anyway. The
 * directory is read once, the filenames held in a set, and a lookup costs
 * nothing. The trade is that clips built while the server is running are not
 * seen until it restarts, which is exactly what a deploy does.
 */

const CLIP_DIR = join(process.cwd(), "public", "audio", "passages");

let built: Set<string> | null = null;

function builtClips(): Set<string> {
  if (built) return built;
  try {
    built = existsSync(CLIP_DIR)
      ? new Set(readdirSync(CLIP_DIR).filter((f) => f.endsWith(".mp3")))
      : new Set();
  } catch {
    // A directory that cannot be read is the same as one with nothing in it:
    // narrate on-device and carry on. Narration failing is not a reason to
    // fail a question.
    built = new Set();
  }
  return built;
}

/** The filename a passage's clip would have. Shared with the build script. */
export function clipFileName(text: string): string {
  return `${createHash("sha256").update(text).digest("hex").slice(0, 16)}.mp3`;
}

/**
 * The URL of this passage's clip, or undefined when there is not one.
 *
 * Undefined rather than a path that might 404, so the browser goes straight
 * to synthesis instead of waiting to find out.
 */
export function passageClipUrl(text: string): string | undefined {
  const name = clipFileName(text);
  return builtClips().has(name) ? `/audio/passages/${name}` : undefined;
}

/** Forgets the cached listing. For tests, and for a script that just built some. */
export function forgetBuiltClips(): void {
  built = null;
}

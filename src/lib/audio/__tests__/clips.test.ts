import { afterEach, describe, expect, it } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { clipFileName, forgetBuiltClips, passageClipUrl } from "../clips";

/**
 * Whether a passage claims to have a narration clip.
 *
 * This looks like a small piece of plumbing and it is the thing that broke
 * the most important accessibility feature in the product. The URL used to be
 * returned unconditionally, on the reasoning that the browser could discover
 * a missing file for itself. It cannot: measured in Chrome, `audio.play()` on
 * a URL that 404s never settles and fires no error, so the player waited for
 * ever and the fallback to on-device speech never ran. No clips have ever
 * been built, so the read-aloud button on every passage did nothing.
 *
 * Hence the rule these tests hold: say there is a clip only when there is
 * one.
 */

const CLIP_DIR = join(process.cwd(), "public", "audio", "passages");
const TEXT = "A passage that exists only inside this test.";

afterEach(() => {
  // Only ever removes the one file this test wrote.
  rmSync(join(CLIP_DIR, clipFileName(TEXT)), { force: true });
  forgetBuiltClips();
});

describe("passageClipUrl", () => {
  it("says nothing rather than pointing at a file that is not there", () => {
    forgetBuiltClips();
    expect(passageClipUrl(TEXT)).toBeUndefined();
  });

  it("points at the clip once it has been built", () => {
    mkdirSync(CLIP_DIR, { recursive: true });
    writeFileSync(join(CLIP_DIR, clipFileName(TEXT)), "not really an mp3");
    forgetBuiltClips();

    expect(passageClipUrl(TEXT)).toBe(`/audio/passages/${clipFileName(TEXT)}`);
  });

  it("names a clip after its text, so an edited passage gets a new one", () => {
    // The failure this prevents is a child hearing one sentence while reading
    // another, which is worse than hearing the device's own voice.
    expect(clipFileName("one")).not.toBe(clipFileName("one "));
    expect(clipFileName("one")).toBe(clipFileName("one"));
    expect(clipFileName("one")).toMatch(/^[0-9a-f]{16}\.mp3$/);
  });
});

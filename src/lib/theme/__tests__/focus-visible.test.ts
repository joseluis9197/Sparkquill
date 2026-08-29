import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../../..", import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory()
      ? walk(path)
      : /\.(ts|tsx|css)$/.test(name)
        ? [path]
        : [];
  });
}

const FILES = walk(SRC)
  .map((path) => ({
    path: path.slice(SRC.length).split(sep).join("/"),
    text: readFileSync(path, "utf8"),
  }))
  // Tests are not shipped interface, and this one has to name the thing it
  // is looking for in order to look for it.
  .filter((f) => !f.path.includes("__tests__"));

/**
 * Nothing may switch the focus ring off.
 *
 * Every text input in the product used to carry `outline-none`, replacing a
 * ring with a one-pixel border that changed colour — a cue that is thin,
 * colour-only, and in one place had been dropped entirely, leaving a field
 * with no visible focus at all. That field was on the profile picker: the PIN
 * a child types to get in.
 *
 * The rule in globals.css draws a 3px ring on `:focus-visible` for everything.
 * It only works if nothing opts out, so this is the thing that has to be
 * checked, not the ring itself.
 */
describe("focus stays visible", () => {
  const SUPPRESSORS = [
    /\boutline-none\b/,
    /outline:\s*none/,
    /outline:\s*0\b/,
    /\boutline-0\b/,
  ];

  for (const { path, text } of FILES) {
    // globals.css is where the ring is defined, so it is allowed to say
    // "outline" as much as it likes — but not to turn one off.
    it(`${path} does not suppress it`, () => {
      const hits = SUPPRESSORS.filter((re) => re.test(text)).map(String);
      expect(hits, `${path} suppresses the focus ring`).toEqual([]);
    });
  }

  it("and the ring itself is still declared", () => {
    const css = FILES.find((f) => f.path.endsWith("globals.css"))!.text;
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--focus\)/);
  });
});

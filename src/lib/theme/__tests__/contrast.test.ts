import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  blockBody,
  contrast,
  over,
  parseHex,
  resolveTokens,
  type Theme,
} from "../contrast";

const CSS = readFileSync(
  fileURLToPath(new URL("../../../app/globals.css", import.meta.url)),
  "utf8",
);

const THEMES: Theme[] = ["light", "dark"];
const tokens = Object.fromEntries(
  THEMES.map((t) => [t, resolveTokens(CSS, t)]),
) as Record<Theme, Map<string, string>>;

function token(theme: Theme, name: string): string {
  const v = tokens[theme].get(name);
  if (!v) throw new Error(`${name} is not a colour in the ${theme} theme`);
  return v;
}

/**
 * Every foreground/background pairing the product actually renders.
 *
 * `need` is 4.5 for body text (WCAG 1.4.3 AA), 3 for large text and for
 * non-text indicators like the focus ring (1.4.11).
 */
const PAIRS: { what: string; fg: string; bg: string; need: number }[] = [
  { what: "body text on the page", fg: "--text", bg: "--surface", need: 4.5 },
  { what: "body text on a raised panel", fg: "--text", bg: "--surface-2", need: 4.5 },
  { what: "body text on the deepest panel", fg: "--text", bg: "--surface-3", need: 4.5 },
  { what: "captions on the page", fg: "--text-muted", bg: "--surface", need: 4.5 },
  { what: "captions on a raised panel", fg: "--text-muted", bg: "--surface-2", need: 4.5 },
  { what: "captions on the deepest panel", fg: "--text-muted", bg: "--surface-3", need: 4.5 },
  { what: "label on a primary button", fg: "--brand-contrast", bg: "--brand", need: 4.5 },
  { what: "brand-coloured link on the page", fg: "--brand", bg: "--surface", need: 4.5 },
  { what: "brand-coloured link on a panel", fg: "--brand", bg: "--surface-2", need: 4.5 },
  // The number line writes its values in ink on the accent pill.
  { what: "number-line pill value", fg: "--color-ink-900", bg: "--accent", need: 4.5 },
  // A revealed answer keeps ink on the verdict tints, which do not flip.
  { what: "text on a correct answer", fg: "--color-ink-900", bg: "--color-grow-100", need: 4.5 },
  { what: "text on a wrong answer", fg: "--color-ink-900", bg: "--color-ember-100", need: 4.5 },
  // Non-text: the focus ring has to be findable against what it sits on.
  { what: "focus ring against the page", fg: "--focus", bg: "--surface", need: 3 },
  { what: "focus ring against a panel", fg: "--focus", bg: "--surface-2", need: 3 },
  { what: "focus ring against the deepest panel", fg: "--focus", bg: "--surface-3", need: 3 },
];

describe("colour tokens meet WCAG 2.1 AA", () => {
  for (const theme of THEMES) {
    for (const pair of PAIRS) {
      it(`${theme}: ${pair.what}`, () => {
        const ratio = contrast(token(theme, pair.fg), token(theme, pair.bg));
        expect(
          ratio,
          `${pair.fg} on ${pair.bg} is ${ratio.toFixed(2)}:1, needs ${pair.need}:1`,
        ).toBeGreaterThanOrEqual(pair.need);
      });
    }
  }
});

/**
 * The coin faces, which are drawn in real metal colours rather than tokens.
 *
 * These sit outside the theme on purpose: a nickel is the colour of a nickel
 * in the dark as much as in the light. That is exactly why they need their own
 * check — nothing else in the system would catch them.
 */
const COIN_TINTS = {
  penny: "#bd7f56",
  nickel: "#9aa2a8",
  dime: "#a8b0b6",
  quarter: "#8f979d",
};

describe("the value on a coin is readable", () => {
  const ink = "#16211e";
  for (const [name, tint] of Object.entries(COIN_TINTS)) {
    it(`${name}, counted`, () => {
      expect(contrast(ink, tint)).toBeGreaterThanOrEqual(4.5);
    });

    // Uncounted coins are the state every coin starts in, so whatever dimming
    // they carry has to hold the ratio too. Composited over both page grounds.
    for (const [theme, ground] of [
      ["light", "#ffffff"],
      ["dark", "#101a18"],
    ] as const) {
      it(`${name}, not yet counted, on the ${theme} page`, () => {
        const alpha = 1; // no dimming: see MoneyCounter
        expect(
          contrast(over(ink, alpha, ground), over(tint, alpha, ground)),
        ).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe("the two dark declarations stay in step", () => {
  /*
   * The dark palette is written twice: once under prefers-color-scheme for
   * people who never touch a toggle, and once under [data-theme="dark"] for
   * people who do. Nothing keeps them equal except care, and a drift between
   * them shows up only for whichever half of the users hits the stale copy.
   */
  it("declare the same tokens with the same values", () => {
    const media = blockBody(CSS, ':root:not([data-theme="light"])');
    const explicit = blockBody(CSS, ':root[data-theme="dark"]');
    const decls = (block: string) =>
      Object.fromEntries(
        [...block.matchAll(/(--[a-z0-9-]+|color-scheme)\s*:\s*([^;]+);/gi)].map(
          (m) => [m[1], m[2].trim()],
        ),
      );
    expect(decls(media)).toEqual(decls(explicit));
  });
});

describe("the resolver itself", () => {
  it("follows var() chains to a literal", () => {
    // --text is declared as var(--color-ink-900) and must come back as hex.
    expect(token("light", "--text")).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("agrees with the known ratio of black on white", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("reads short hex", () => {
    expect(parseHex("#fff")).toEqual([255, 255, 255]);
  });

  it("light and dark really differ", () => {
    expect(token("light", "--surface")).not.toBe(token("dark", "--surface"));
  });
});

/**
 * Contrast arithmetic, and the token graph the product's colours come from.
 *
 * This exists because measuring contrast in a live browser turned out not to
 * be trustworthy. Flipping `data-theme` and reading `getComputedStyle` gives
 * stale values for nodes that already existed — an element with an inline
 * `color: inherit` reported a colour its own parent did not have. The paint
 * was right and the measurement was wrong, which is the worst way round: it
 * invents failures and would just as happily hide real ones.
 *
 * Resolving the tokens straight from `globals.css` has neither problem. It is
 * deterministic, it runs in CI, and it fails the build rather than waiting for
 * somebody to re-run an audit by hand.
 */

export type Rgb = [number, number, number];

export function parseHex(hex: string): Rgb {
  const h = hex.trim().replace(/^#/, "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Not a hex colour: ${hex}`);
  }
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** WCAG relative luminance. */
export function luminance([r, g, b]: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio, 1 to 21. Order of the arguments does not matter. */
export function contrast(a: string | Rgb, b: string | Rgb): number {
  const la = luminance(typeof a === "string" ? parseHex(a) : a);
  const lb = luminance(typeof b === "string" ? parseHex(b) : b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Composites a colour drawn at partial opacity over what sits behind it.
 *
 * Element opacity fades the text *and* its background together toward the page
 * beneath, so a dimmed control loses contrast on both sides at once. That cost
 * is easy to miss by eye and is exactly what this makes checkable.
 */
export function over(colour: string | Rgb, alpha: number, behind: string | Rgb): Rgb {
  const c = typeof colour === "string" ? parseHex(colour) : colour;
  const b = typeof behind === "string" ? parseHex(behind) : behind;
  return [0, 1, 2].map((i) => alpha * c[i] + (1 - alpha) * b[i]) as Rgb;
}

export type Theme = "light" | "dark";

/**
 * Reads the custom properties out of globals.css for one theme.
 *
 * The palette in `@theme` is shared; `:root` carries the light surface tokens
 * and `:root[data-theme="dark"]` overrides them. The dark block is taken as
 * authoritative rather than the `prefers-color-scheme` one because the two are
 * kept identical by hand — and a test that reads only one of them would not
 * notice if they drifted, so `assertDarkBlocksAgree` checks that separately.
 */
export function resolveTokens(css: string, theme: Theme): Map<string, string> {
  const raw = new Map<string, string>();

  const collect = (block: string) => {
    for (const [, name, value] of block.matchAll(
      /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi,
    )) {
      raw.set(name, value.trim());
    }
  };

  collect(blockBody(css, "@theme"));
  collect(blockBody(css, ":root"));
  if (theme === "dark") collect(blockBody(css, ':root[data-theme="dark"]'));

  // Follow var() indirection until every token is a literal.
  const resolved = new Map<string, string>();
  const resolve = (name: string, seen = new Set<string>()): string => {
    if (resolved.has(name)) return resolved.get(name)!;
    if (seen.has(name)) throw new Error(`Token cycle at ${name}`);
    seen.add(name);
    const value = raw.get(name);
    if (value === undefined) throw new Error(`Undefined token ${name}`);
    const ref = value.match(/^var\((--[a-z0-9-]+)\)$/i);
    const out = ref ? resolve(ref[1], seen) : value;
    resolved.set(name, out);
    return out;
  };

  for (const name of raw.keys()) {
    // Non-colour tokens (fonts, radii) are left alone.
    try {
      const v = resolve(name);
      if (/^#[0-9a-f]{3,8}$/i.test(v)) resolved.set(name, v);
    } catch {
      /* not a colour chain */
    }
  }
  return resolved;
}

/** The text of the first top-level block with this selector. */
export function blockBody(css: string, selector: string): string {
  const start = css.indexOf(selector + " {");
  if (start === -1) throw new Error(`No block for ${selector}`);
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(css.indexOf("{", start) + 1, i);
    }
  }
  throw new Error(`Unclosed block for ${selector}`);
}

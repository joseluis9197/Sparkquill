import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { GENERATORS } from "../registry";
import WidgetHost, { IMPLEMENTED_WIDGETS } from "@/components/practice/WidgetHost";

/**
 * Every manipulative a generator asks for must exist, and must actually draw.
 *
 * The widget host renders nothing for an unknown key rather than throwing,
 * which is the right behaviour at runtime — a child should never see a box
 * apologising for missing software. The cost is that a typo, or a generator
 * written against a component that was never built, disappears silently: the
 * question still works, it is just missing the picture that was the reason
 * the question was written that way.
 *
 * This is the test that makes that visible at build time instead.
 */

/** One example of every distinct (widget, config shape) a generator can emit. */
const SPECS = (() => {
  const out = new Map<
    string,
    { generator: string; widget: NonNullable<ReturnType<(typeof GENERATORS)[number]["generate"]>["widget"]> }
  >();
  for (const g of GENERATORS) {
    for (const difficulty of ["easy", "core", "stretch"] as const) {
      for (let seed = 1; seed <= 40; seed++) {
        const item = g.generate({ seed, difficulty });
        if (!item.widget) continue;
        const shape = Object.keys(item.widget.config ?? {}).sort().join(",");
        const id = `${g.key} → ${item.widget.key} {${shape}}`;
        if (!out.has(id)) out.set(id, { generator: g.key, widget: item.widget });
      }
    }
  }
  return out;
})();

describe("widget wiring", () => {
  const used = new Map<string, string[]>();
  for (const { generator, widget } of SPECS.values()) {
    const keys = used.get(widget.key) ?? [];
    if (!keys.includes(generator)) keys.push(generator);
    used.set(widget.key, keys);
  }

  it("has a component for every widget a generator requests", () => {
    for (const [key, generators] of used) {
      expect(
        IMPLEMENTED_WIDGETS.has(key),
        `"${key}" is requested by ${generators.slice(0, 3).join(", ")} but has no component`,
      ).toBe(true);
    }
  });

  it("does not carry components nothing asks for", () => {
    // The other direction. A widget with no caller is dead weight that still
    // ships to the browser.
    for (const key of IMPLEMENTED_WIDGETS) {
      expect(used.has(key), `"${key}" has a component but no generator uses it`).toBe(
        true,
      );
    }
  });

  /*
   * The key matching is not enough, and the two bugs this test was extended
   * for are why.
   *
   * A generator hands the host a bag of config, and the host reads named
   * fields out of it. Nothing had ever checked that the names agreed. When
   * `g2.m.countMoney` sent `parts` where MoneyCounter reads `coins`, the
   * widget dereferenced undefined and took down the whole page — every second
   * grader's maths practice, because that skill is in their pool. Its
   * neighbour `g2.fr.partition` had the same slip against `denominator`, and
   * because that prop is optional it failed the quiet way instead: no fraction
   * bar, on the question whose entire point is seeing the shape split up.
   *
   * So the widgets are rendered here, with the config the generators really
   * produce. Server rendering is the right level: it is where the first
   * question of every session is drawn, so a crash here is a crash there.
   */
  it("renders with the config its generator actually produces", () => {
    for (const [id, { widget }] of SPECS) {
      let html: string;
      try {
        html = renderToStaticMarkup(<WidgetHost widget={widget} audio={false} />);
      } catch (e) {
        throw new Error(`${id} threw while rendering: ${(e as Error).message}`);
      }
      // Empty output means the host fell through to a null branch — an
      // unrecognised key, or a config field the component needed and did not
      // find. Either way the child is looking at a question missing its
      // manipulative.
      expect(html, `${id} rendered nothing`).not.toBe("");
    }
  });
});

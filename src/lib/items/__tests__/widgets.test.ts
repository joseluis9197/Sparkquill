import { describe, it, expect } from "vitest";
import { GENERATORS } from "../registry";
import { IMPLEMENTED_WIDGETS } from "@/components/practice/WidgetHost";

/**
 * Every manipulative a generator asks for must exist.
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
describe("widget wiring", () => {
  const used = new Map<string, string[]>();
  for (const g of GENERATORS) {
    for (const difficulty of ["easy", "core", "stretch"] as const) {
      for (let seed = 1; seed <= 40; seed++) {
        const item = g.generate({ seed, difficulty });
        if (!item.widget) continue;
        const keys = used.get(item.widget.key) ?? [];
        if (!keys.includes(g.key)) keys.push(g.key);
        used.set(item.widget.key, keys);
      }
    }
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
});

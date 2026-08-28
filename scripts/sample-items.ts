import { GENERATORS } from "../src/lib/items/registry";
import type { MultipleChoiceItem } from "../src/lib/items/types";

/**
 * Prints a sample of generated items so distractor quality can be eyeballed
 * without clicking through the app. Not part of the build.
 */
const difficulties = ["easy", "core", "stretch"] as const;
const only = process.argv[2];

for (const g of GENERATORS) {
  if (only && !g.key.includes(only)) continue;
  console.log(`\n=== ${g.key}  (${g.benchmark}) ===`);
  for (const difficulty of difficulties) {
    for (const seed of [1, 2, 3]) {
      const item = g.generate({ seed, difficulty }) as MultipleChoiceItem;
      const opts = item.choices
        .map((c) => `${c.label}${c.misconception ? ` [${c.misconception}]` : " *"}`)
        .join("   ");
      console.log(`${difficulty.padEnd(8)} ${item.stem}`);
      console.log(`         ${opts}`);
    }
  }
}

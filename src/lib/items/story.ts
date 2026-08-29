/**
 * Names, objects and settings for word problems.
 *
 * Shared across every grade so the world a child practises in stays the same
 * as they move up through it, and deliberately varied: a question bank where
 * every child is called Tom and buys apples reads as though it were written
 * for somebody else.
 *
 * Names are drawn from the ones actually common in Florida classrooms.
 */

export const NAMES = [
  "Ana", "Ben", "Camila", "Diego", "Elena", "Farid", "Grace", "Hana",
  "Ivan", "Jamal", "Kai", "Lena", "Mateo", "Nia", "Omar", "Priya",
  "Quinn", "Rosa", "Samir", "Tessa", "Uma", "Victor", "Wren", "Yusuf",
] as const;

export const COUNTABLES = [
  { one: "shell", many: "shells" },
  { one: "sticker", many: "stickers" },
  { one: "marble", many: "marbles" },
  { one: "crayon", many: "crayons" },
  { one: "acorn", many: "acorns" },
  { one: "button", many: "buttons" },
  { one: "grape", many: "grapes" },
  { one: "block", many: "blocks" },
  { one: "bead", many: "beads" },
  { one: "card", many: "cards" },
  { one: "seed", many: "seeds" },
  { one: "coin", many: "coins" },
] as const;

/** Contexts that scale: the same orchard works for 6 apples or 6,000. */
export const SETTINGS = [
  { place: "the school library", unit: "book", units: "books" },
  { place: "the orange grove", unit: "crate", units: "crates" },
  { place: "the aquarium", unit: "fish", units: "fish" },
  { place: "the bike shop", unit: "wheel", units: "wheels" },
  { place: "the bakery", unit: "roll", units: "rolls" },
  { place: "the stadium", unit: "seat", units: "seats" },
  { place: "the plant nursery", unit: "seedling", units: "seedlings" },
  { place: "the recycling centre", unit: "bottle", units: "bottles" },
] as const;

export const COINS = [
  { name: "penny", plural: "pennies", value: 1 },
  { name: "nickel", plural: "nickels", value: 5 },
  { name: "dime", plural: "dimes", value: 10 },
  { name: "quarter", plural: "quarters", value: 25 },
] as const;

/** "a, b and c" — the serial comma is left out, as Florida's items do. */
export function listWords(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

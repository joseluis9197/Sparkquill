import type { ItemGenerator } from "./types";
import {
  additionWithinHundred,
  subtractionWithinHundred,
} from "./generators/g2-addition";
import {
  compareNumbers,
  expandedFormItem,
  roundToTen,
  wordForm,
} from "./generators/g2-place-value";
import { tellTimeToFiveMinutes } from "./generators/g2-time";
import { solidAttributes, solidRealWorld } from "./generators/g2-solids";
import {
  linesOfSymmetry,
  nameTheShape,
  perimeter,
  shapeSides,
} from "./generators/g2-shapes";
import {
  evenOdd,
  factsToTwenty,
  repeatedAddition,
  tenMoreLess,
  trueOrFalse,
  unknownNumber,
} from "./generators/g2-algebra";
import {
  countMoney,
  lengthDifference,
  partitionShapes,
  readData,
} from "./generators/g2-measurement";

/**
 * Every generator in the platform. Keyed lookup so a stored attempt can be
 * replayed years later from nothing but a template key and a seed.
 */
export const GENERATORS: ItemGenerator[] = [
  additionWithinHundred,
  subtractionWithinHundred,
  wordForm,
  expandedFormItem,
  roundToTen,
  compareNumbers,
  tellTimeToFiveMinutes,
  solidAttributes,
  solidRealWorld,
  shapeSides,
  nameTheShape,
  linesOfSymmetry,
  perimeter,
  evenOdd,
  repeatedAddition,
  trueOrFalse,
  unknownNumber,
  tenMoreLess,
  factsToTwenty,
  countMoney,
  lengthDifference,
  readData,
  partitionShapes,
];

const BY_KEY = new Map(GENERATORS.map((g) => [g.key, g]));

export function getGenerator(key: string): ItemGenerator {
  const g = BY_KEY.get(key);
  if (!g) throw new Error(`Unknown generator: ${key}`);
  return g;
}

export function generatorsForBenchmark(benchmark: string): ItemGenerator[] {
  return GENERATORS.filter((g) => g.benchmark === benchmark);
}

export function generatorsForSkill(skillSlug: string): ItemGenerator[] {
  return GENERATORS.filter((g) => g.skillSlug === skillSlug);
}

/** Benchmarks that currently have at least one generator behind them. */
export function coveredBenchmarks(): string[] {
  return [...new Set(GENERATORS.map((g) => g.benchmark))].sort();
}

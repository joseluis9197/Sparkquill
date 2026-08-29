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
import {
  countSequence,
  g1Compare,
  g1ExpandedForm,
  g1FactsToTen,
  g1OneTenMoreLess,
  g1SumsToTwenty,
  g1TensAndOnes,
  g1TwoDigitMinusOne,
  g1TwoDigitPlusOne,
  g1WordForm,
} from "./generators/g1-number";
import {
  g1AddThree,
  g1CoinValue,
  g1ComposeShapes,
  g1CountCoins,
  g1HalvesFourths,
  g1MeasureLength,
  g1MissingAddend,
  g1OrderLengths,
  g1Pictograph,
  g1ShapeFromAttributes,
  g1Tallies,
  g1TellTime,
  g1TrueFalse,
  g1UnknownNumber,
  g1WordProblem,
} from "./generators/g1-rest";
import {
  g2BuildGraph,
  g2ChooseUnit,
  g2LengthProblem,
  g2PartitionTwoWays,
  g2PerimeterUnits,
  g2ThreeDigit,
  g2TwoStepProblem,
} from "./generators/g2-gaps";

/**
 * Every generator in the platform. Keyed lookup so a stored attempt can be
 * replayed years later from nothing but a template key and a seed.
 */
export const GENERATORS: ItemGenerator[] = [
  /* Grade 1 */
  countSequence,
  g1WordForm,
  g1ExpandedForm,
  g1TensAndOnes,
  g1Compare,
  g1FactsToTen,
  g1SumsToTwenty,
  g1OneTenMoreLess,
  g1TwoDigitPlusOne,
  g1TwoDigitMinusOne,
  g1HalvesFourths,
  g1AddThree,
  g1WordProblem,
  g1MissingAddend,
  g1TrueFalse,
  g1UnknownNumber,
  g1MeasureLength,
  g1OrderLengths,
  g1TellTime,
  g1CoinValue,
  g1CountCoins,
  g1ShapeFromAttributes,
  g1ComposeShapes,
  g1Tallies,
  g1Pictograph,

  /* Grade 2 */
  additionWithinHundred,
  g2ThreeDigit,
  g2PartitionTwoWays,
  g2TwoStepProblem,
  g2ChooseUnit,
  g2LengthProblem,
  g2PerimeterUnits,
  g2BuildGraph,
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

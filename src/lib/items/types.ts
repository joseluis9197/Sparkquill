/**
 * Item model.
 *
 * The shapes here mirror the item types that actually appear on FAST (see
 * docs/plan.html §01). If a child only ever practises multiple choice and
 * then meets an Equation Editor on test day, the practice did not transfer.
 *
 * Everything is plain data so the same item can be rendered on the server,
 * cached, replayed for support, and scored without re-running the generator.
 */

export type ItemType =
  | "multiple_choice"
  | "multiselect"
  | "editing_task_choice"
  | "hot_text"
  | "table_match"
  | "equation_editor"
  | "grid_drag"
  | "fraction_model"
  | "graphing"
  | "ebsr";

/**
 * A catalogued wrong answer. `misconception` is the whole point: when a child
 * repeatedly picks the same kind of distractor, the engine serves the lesson
 * for that specific error instead of simply serving more practice.
 */
export interface Choice {
  id: string;
  label: string;
  /** Null on the correct choice. */
  misconception?: MisconceptionKey;
}

/** Catalogue of error types. Extend deliberately — these drive remediation. */
export type MisconceptionKey =
  | "no_regrouping" // 47 + 25 = 62
  | "column_independent" // 47 + 25 = 612
  | "wrong_operation" // subtracted instead of adding
  | "off_by_one"
  | "place_value_confusion" // read 305 as "thirty-five"
  | "digit_reversal"
  | "rounded_wrong_direction"
  | "rounded_wrong_place"
  | "compared_wrong_direction" // answered the smaller when asked for greater
  | "counted_endpoints" // counted both ends of an interval
  | "hour_minute_swap" // read clock hands backwards
  | "minute_by_ones" // read the minute hand as a raw number
  | "ignored_units"
  | "perimeter_area_confusion"
  | "counted_faces_as_vertices"
  | "skipped_hidden_faces" // only counted the faces they could see
  | "used_numerator_only"
  | "used_part_not_whole" // answered with one part where the total was asked
  /* Multiplicative reasoning, grades 3-4 */
  | "added_instead_of_multiplied" // 6 x 4 = 10
  | "multiplied_instead_of_divided"
  | "reversed_dividend_divisor" // computed 3 / 12 for "12 divided by 3"
  | "dropped_remainder"
  | "remainder_as_whole" // wrote the remainder where the quotient goes
  | "off_by_one_factor" // recalled a neighbouring fact
  | "skip_count_wrong_step"
  /* Fractions, grades 3-5 */
  | "numerator_denominator_swap"
  | "added_denominators" // 1/4 + 1/4 = 2/8
  | "compared_denominators_only" // 1/8 > 1/4 because 8 > 4
  | "ignored_common_denominator"
  | "whole_number_part_only" // answered a mixed number's integer part
  /* Decimals and percent, grades 4-6 */
  | "decimal_point_misplaced"
  | "decimal_longer_is_bigger" // 0.45 > 0.5 because it has more digits
  | "percent_shift_wrong_way"
  /* Algebraic reasoning, grades 5-6 */
  | "order_of_operations"
  | "inverse_operation_missed" // added where they needed to subtract
  | "sign_error"
  | "absolute_value_kept_sign"
  | "exponent_as_multiplication" // 2^4 = 8
  | "gcf_lcm_swap"
  | "ratio_order_swap"
  /* Measurement, geometry and data */
  | "converted_wrong_direction"
  | "counted_unit_lengths_not_squares"
  | "volume_as_area" // multiplied two dimensions instead of three
  | "surface_area_missing_faces"
  | "coordinates_swapped"
  | "quadrant_sign_swap"
  | "mean_median_confusion"
  | "range_as_sum"
  | "read_scale_by_ones" // ignored a scaled axis on a graph
  | "distractor_plausible"; // near miss with no single named cause

/** An interactive manipulative attached to an item or a lesson. */
export interface WidgetSpec {
  key: string;
  config: Record<string, unknown>;
}

interface ItemBase {
  /** Stable within a (template, seed) pair. */
  id: string;
  templateKey: string;
  seed: number;
  benchmark: string;
  skillSlug: string;
  /** Prompt as displayed. */
  stem: string;
  /**
   * What the narrator reads aloud. Kept separate from `stem` because "3 + 4"
   * must be spoken as "three plus four", and because ELA passages must be
   * excluded from audio in assessment mode.
   */
  audioText: string;
  widget?: WidgetSpec;
  /** Shown after answering, never before. */
  explanation: string;
  /** Progressive hints, cheapest first. */
  hints: string[];
  difficulty: number;
}

export interface MultipleChoiceItem extends ItemBase {
  type: "multiple_choice";
  choices: Choice[];
  correctId: string;
}

export interface MultiselectItem extends ItemBase {
  type: "multiselect";
  choices: Choice[];
  correctIds: string[];
  /** FAST tells the student how many to pick; so do we. */
  selectCount: number;
}

export interface EquationEditorItem extends ItemBase {
  type: "equation_editor";
  /** Canonical answer as a string so "0.50" and "0.5" can be compared. */
  answer: string;
  /** Accepted equivalent forms. */
  accepts: string[];
  unit?: string;
}

export interface TableMatchItem extends ItemBase {
  type: "table_match";
  rows: { id: string; label: string }[];
  columns: { id: string; label: string }[];
  /** rowId -> columnId */
  answer: Record<string, string>;
}

export interface HotTextItem extends ItemBase {
  type: "hot_text";
  /** The passage split into selectable tokens. */
  tokens: { id: string; text: string; selectable: boolean }[];
  correctIds: string[];
}

export interface EbsrItem extends ItemBase {
  type: "ebsr";
  partA: { stem: string; choices: Choice[]; correctId: string };
  partB: { stem: string; choices: Choice[]; correctId: string };
}

export type Item =
  | MultipleChoiceItem
  | MultiselectItem
  | EquationEditorItem
  | TableMatchItem
  | HotTextItem
  | EbsrItem;

/* ------------------------------------------------------------------ *
 * Responses and scoring
 * ------------------------------------------------------------------ */

export type ItemResponse =
  | { type: "multiple_choice"; choiceId: string }
  | { type: "multiselect"; choiceIds: string[] }
  | { type: "equation_editor"; value: string }
  | { type: "table_match"; pairs: Record<string, string> }
  | { type: "hot_text"; tokenIds: string[] }
  | { type: "ebsr"; partA: string; partB: string };

export interface ScoreResult {
  correct: boolean;
  /** Which misconception the response points at, when one is identifiable. */
  misconception?: MisconceptionKey;
  /** For multi-part items: how much of it was right, 0-1. */
  partialCredit: number;
}

/* ------------------------------------------------------------------ *
 * Generators
 * ------------------------------------------------------------------ */

export interface GeneratorContext {
  seed: number;
  /**
   * Requested difficulty band. Generators vary the numbers, not the concept —
   * a harder place-value item is still a place-value item.
   */
  difficulty: "easy" | "core" | "stretch";
}

export interface ItemGenerator {
  key: string;
  benchmark: string;
  skillSlug: string;
  /**
   * What a parent sees this skill called in the report.
   *
   * Declared next to the questions rather than in a lookup table beside the
   * seeding script: with two hundred skills a separate table is a list that
   * silently falls behind, and a skill whose title has gone missing shows a
   * parent a URL slug where a sentence should be.
   *
   * Written for the parent, not the standard. "Adding within 100" tells them
   * something; "MA.2.NSO.2.1" does not.
   */
  skillTitle: string;
  itemTypes: ItemType[];
  generate(ctx: GeneratorContext): Item;
}

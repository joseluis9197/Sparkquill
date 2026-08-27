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
  | "counted_endpoints" // counted both ends of an interval
  | "hour_minute_swap" // read clock hands backwards
  | "minute_by_ones" // read the minute hand as a raw number
  | "ignored_units"
  | "perimeter_area_confusion"
  | "counted_faces_as_vertices"
  | "skipped_hidden_faces" // only counted the faces they could see
  | "used_numerator_only"
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
  itemTypes: ItemType[];
  generate(ctx: GeneratorContext): Item;
}

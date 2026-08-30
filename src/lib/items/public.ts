import type {
  EbsrItem,
  EquationEditorItem,
  HotTextItem,
  Item,
  MultipleChoiceItem,
  MultiselectItem,
  TableMatchItem,
} from "./types";

/**
 * Items as the browser is allowed to see them.
 *
 * Every field that would give the answer away is removed here, and each type
 * is rebuilt field by field rather than by omitting keys from the full item.
 * That is deliberate: `Omit<Item, "correctId">` silently starts leaking the
 * day someone adds a second answer-bearing field, and the compiler will not
 * say a word. Listing the safe fields means a new field is invisible to the
 * browser until somebody adds it here on purpose.
 *
 * What has to be stripped differs by type, and each one is a way to leak:
 *   - multiple choice and multiselect: the correct ids, and the misconception
 *     label on each distractor, which names the error and so names the answer
 *   - equation editor: the answer and its accepted variants
 *   - hot text: which tokens are correct
 *   - table match: the row-to-column mapping
 *   - EBSR: the correct id of each part, including part B, which is where the
 *     evidence for part A lives
 * And in every case the explanation, which states the answer in prose.
 */

interface PublicBase {
  id: string;
  templateKey: string;
  seed: number;
  benchmark: string;
  skillSlug: string;
  stem: string;
  audioText: string;
  widget?: { key: string; config: Record<string, unknown> };
  passage?: {
    id: string;
    title: string;
    text: string;
    genre: string;
    /** Pre-generated narration, when a clip has been built for this text. */
    clipUrl?: string;
  };
  hints: string[];
  difficulty: number;
}

export type PublicChoice = { id: string; label: string };

export type PublicItem =
  | (PublicBase & { type: "multiple_choice"; choices: PublicChoice[] })
  | (PublicBase & {
      type: "multiselect";
      choices: PublicChoice[];
      selectCount: number;
    })
  | (PublicBase & { type: "equation_editor"; unit?: string })
  | (PublicBase & {
      type: "hot_text";
      tokens: { id: string; text: string; selectable: boolean }[];
      selectCount?: number;
    })
  | (PublicBase & {
      type: "table_match";
      rows: { id: string; label: string }[];
      columns: { id: string; label: string }[];
    })
  | (PublicBase & {
      type: "ebsr";
      partA: { stem: string; choices: PublicChoice[] };
      partB: { stem: string; choices: PublicChoice[] };
    });

function base(item: Item, clipUrl?: ClipResolver): PublicBase {
  return {
    id: item.id,
    templateKey: item.templateKey,
    seed: item.seed,
    benchmark: item.benchmark,
    skillSlug: item.skillSlug,
    stem: item.stem,
    audioText: item.audioText,
    widget: item.widget,
    // The clip path is derived here rather than stored on the item, so a
    // passage recorded after an item was generated is picked up without the
    // item having to be regenerated.
    passage: item.passage
      ? { ...item.passage, clipUrl: clipUrl?.(item.passage.text) }
      : undefined,
    hints: item.hints,
    difficulty: item.difficulty,
  };
}

const safeChoices = (cs: { id: string; label: string }[]): PublicChoice[] =>
  cs.map((c) => ({ id: c.id, label: c.label }));

/**
 * How to find a passage's narration clip, when the caller can look.
 *
 * Passed in rather than imported, because this module is used by client
 * components as well as by server actions, and finding a clip means reading
 * a directory. Importing the server-side resolver here put `node:fs` into the
 * browser bundle and broke every page that renders an item.
 *
 * Callers that cannot look — the no-account demo, which builds its questions
 * entirely in the browser — pass nothing and get on-device narration, which
 * is what they would have got anyway.
 */
export type ClipResolver = (text: string) => string | undefined;

export function toPublicItem(
  item: Item,
  clipUrl?: ClipResolver,
): PublicItem {
  switch (item.type) {
    case "multiple_choice": {
      const i = item as MultipleChoiceItem;
      return { ...base(i, clipUrl), type: "multiple_choice", choices: safeChoices(i.choices) };
    }
    case "multiselect": {
      const i = item as MultiselectItem;
      return {
        ...base(i, clipUrl),
        type: "multiselect",
        choices: safeChoices(i.choices),
        // The count is shown on purpose. FAST tells the student how many to
        // pick, and hiding it would make the item harder than the real test
        // in a way that has nothing to do with the mathematics.
        selectCount: i.selectCount,
      };
    }
    case "equation_editor": {
      const i = item as EquationEditorItem;
      return { ...base(i, clipUrl), type: "equation_editor", unit: i.unit };
    }
    case "hot_text": {
      const i = item as HotTextItem;
      return {
        ...base(i, clipUrl),
        type: "hot_text",
        tokens: i.tokens.map((t) => ({
          id: t.id,
          text: t.text,
          selectable: t.selectable,
        })),
        selectCount: i.correctIds.length,
      };
    }
    case "table_match": {
      const i = item as TableMatchItem;
      return {
        ...base(i, clipUrl),
        type: "table_match",
        rows: i.rows.map((r) => ({ id: r.id, label: r.label })),
        columns: i.columns.map((c) => ({ id: c.id, label: c.label })),
      };
    }
    case "ebsr": {
      const i = item as EbsrItem;
      return {
        ...base(i, clipUrl),
        type: "ebsr",
        partA: { stem: i.partA.stem, choices: safeChoices(i.partA.choices) },
        partB: { stem: i.partB.stem, choices: safeChoices(i.partB.choices) },
      };
    }
  }
}

/**
 * What the right answer was, in the shape the item type needs to show it.
 *
 * Lives here rather than beside the server action because it is a pure
 * function over an item, and a "use server" module may only export async
 * functions — a rule that would otherwise push this into the one file that
 * cannot hold it.
 *
 * Produced only in the reply to a submitted answer, never alongside the
 * question. That separation is the whole reason scoring happens on the
 * server: until the child commits, the answer key does not exist in the page.
 */
export type Reveal =
  | { kind: "ids"; ids: string[] }
  | { kind: "value"; value: string }
  | { kind: "pairs"; pairs: Record<string, string> }
  | { kind: "ebsr"; partA: string; partB: string };

export const NO_REVEAL: Reveal = { kind: "ids", ids: [] };

export function revealFor(item: Item): Reveal {
  switch (item.type) {
    case "multiple_choice":
      return { kind: "ids", ids: [item.correctId] };
    case "multiselect":
      return { kind: "ids", ids: item.correctIds };
    case "hot_text":
      return { kind: "ids", ids: item.correctIds };
    case "equation_editor":
      return { kind: "value", value: item.answer };
    case "table_match":
      return { kind: "pairs", pairs: item.answer };
    case "ebsr":
      return {
        kind: "ebsr",
        partA: item.partA.correctId,
        partB: item.partB.correctId,
      };
  }
}

import { describe, it, expect } from "vitest";
import { PASSAGES, getPassage, passagePool } from "../index";
import { bandFor, searchableText, wordCount } from "../types";

/**
 * The passages are the answer key.
 *
 * Every reading question is built from a passage's annotations rather than
 * from the prose, so an annotation that contradicts its own text produces a
 * question that is confidently wrong. There is no way to check that
 * automatically in general — but the structural mistakes are checkable, and
 * they are the ones that actually happen: a distractor that repeats the
 * answer, a paired text that does not point back, a first grade passage that
 * has quietly grown to four hundred words.
 */

describe("passage library", () => {
  it("has passages for every grade", () => {
    for (let grade = 1; grade <= 6; grade++) {
      expect(
        PASSAGES.filter((p) => p.grade === grade).length,
        `grade ${grade} has no passages`,
      ).toBeGreaterThan(0);
    }
  });

  it("gives every grade a story, an informational text and a poem", () => {
    // The reading benchmarks split three ways by genre. A grade missing a
    // genre cannot have that third of its standards practised at all.
    for (let grade = 1; grade <= 6; grade++) {
      for (const genre of ["literary", "informational", "poetry"] as const) {
        const available = passagePool(grade, { genre });
        expect(
          available.length,
          `grade ${grade} has no ${genre} passage to draw on`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("uses unique ids", () => {
    const ids = PASSAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps each passage inside its grade's length band", () => {
    for (const p of PASSAGES) {
      const [min, max] = bandFor(p);
      const n = wordCount(p);
      expect(n, `${p.id} is ${n} words; grade ${p.grade} expects ${min}-${max}`)
        .toBeGreaterThanOrEqual(min);
      expect(n, `${p.id} is ${n} words; grade ${p.grade} expects ${min}-${max}`)
        .toBeLessThanOrEqual(max);
    }
  });

  it("never lists a wrong meaning that matches the right one", () => {
    // Two identical options is the worst bug a generated item can have, and
    // in vocabulary it comes from a careless annotation rather than from the
    // generator.
    for (const p of PASSAGES) {
      for (const v of p.vocabulary ?? []) {
        expect(
          v.wrongMeanings,
          `${p.id}: "${v.word}" lists its correct meaning as a wrong one`,
        ).not.toContain(v.meaning);
        expect(new Set(v.wrongMeanings).size).toBe(v.wrongMeanings.length);
      }
    }
  });

  it("quotes vocabulary context from the passage itself", () => {
    // The question shows the sentence and asks what the word means in it. If
    // the quoted sentence is not in the text, the child is being asked about
    // a sentence they cannot go back and re-read.
    for (const p of PASSAGES) {
      for (const v of p.vocabulary ?? []) {
        if (v.context.startsWith("the title")) continue;
        // Case-insensitive and whitespace-flattened: a poem breaks a sentence
        // across two lines, and the second line starts with a capital.
        const normalise = (s: string) =>
          s.replace(/\s+/g, " ").replace(/[“”]/g, '"').toLowerCase();
        expect(
          normalise(searchableText(p)).includes(normalise(v.context)),
          `${p.id}: the context quoted for "${v.word}" is not in the passage`,
        ).toBe(true);
      }
    }
  });

  it("quotes figurative phrases from the passage itself", () => {
    for (const p of PASSAGES) {
      for (const f of p.figurative ?? []) {
        const normalise = (s: string) =>
          s.replace(/\s+/g, " ").replace(/[“”]/g, '"').toLowerCase();
        expect(
          normalise(searchableText(p)).includes(normalise(f.phrase)),
          `${p.id}: the figurative phrase "${f.phrase}" is not in the passage`,
        ).toBe(true);
      }
    }
  });

  it("never offers a literal reading identical to the real meaning", () => {
    for (const p of PASSAGES) {
      for (const f of p.figurative ?? []) {
        expect(f.literalReading, `${p.id}: "${f.phrase}"`).not.toBe(f.meaning);
      }
    }
  });

  it("pairs texts symmetrically", () => {
    // Compare-and-contrast items read both sides. A one-way pairing means the
    // other passage's item asks about a text that does not know about it.
    for (const p of PASSAGES) {
      if (!p.pairedWith) continue;
      const other = getPassage(p.pairedWith);
      expect(
        other.pairedWith,
        `${p.id} points at ${other.id}, which points at ${other.pairedWith ?? "nothing"}`,
      ).toBe(p.id);
      expect(other.grade).toBe(p.grade);
      expect(p.sharedWithPair?.length ?? 0).toBeGreaterThan(0);
      expect(p.uniqueToThis?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("does not list the same statement as both shared and unique", () => {
    for (const p of PASSAGES) {
      for (const shared of p.sharedWithPair ?? []) {
        expect(
          p.uniqueToThis ?? [],
          `${p.id}: "${shared}" is listed as both shared and unique`,
        ).not.toContain(shared);
      }
    }
  });

  it("keeps supporting details distinct from the central idea", () => {
    // The central-idea item offers a detail as its main distractor. If a
    // detail *is* the central idea, that item has two correct answers.
    for (const p of PASSAGES) {
      if (!p.centralIdea) continue;
      expect(
        p.supportingDetails ?? [],
        `${p.id}: a supporting detail repeats the central idea`,
      ).not.toContain(p.centralIdea);
    }
  });

  it("keeps notInText statements out of the annotations", () => {
    // These are used as wrong answers everywhere. One that duplicates a real
    // annotation would be offered as both right and wrong in the same item.
    for (const p of PASSAGES) {
      const real = [
        p.centralIdea,
        p.theme,
        p.authorOpinion,
        ...(p.supportingDetails ?? []),
        ...(p.opinionEvidence ?? []),
        ...(p.sequence ?? []),
        ...(p.sharedWithPair ?? []),
        ...(p.uniqueToThis ?? []),
      ].filter(Boolean);
      for (const absent of p.notInText ?? []) {
        expect(real, `${p.id}: "${absent}" is listed as absent but is annotated as true`)
          .not.toContain(absent);
      }
    }
  });

  it("gives an opinion text its evidence, and evidence a text to support", () => {
    for (const p of PASSAGES) {
      if (p.authorOpinion) {
        expect(
          p.opinionEvidence?.length ?? 0,
          `${p.id} states an opinion with nothing to back it`,
        ).toBeGreaterThan(0);
      }
      if (p.opinionEvidence?.length) {
        expect(p.authorOpinion, `${p.id} has evidence but no opinion`).toBeTruthy();
      }
    }
  });

  it("gives every poem a stanza count that matches its text", () => {
    for (const p of PASSAGES) {
      if (p.genre !== "poetry") continue;
      const blocks = p.text.split(/\n\s*\n/).filter((b) => b.trim());
      expect(p.stanzas, `${p.id} claims ${p.stanzas} stanzas`).toBe(blocks.length);
      if (p.linesPerStanza) {
        for (const b of blocks) {
          expect(
            b.trim().split("\n").length,
            `${p.id} claims ${p.linesPerStanza} lines per stanza`,
          ).toBe(p.linesPerStanza);
        }
      }
    }
  });

  it("bounds the pool by grade and never above it", () => {
    for (let grade = 1; grade <= 6; grade++) {
      for (const p of passagePool(grade)) {
        expect(
          p.grade,
          `${p.id} is grade ${p.grade} but appeared in the grade ${grade} pool`,
        ).toBeLessThanOrEqual(grade);
      }
    }
  });
});

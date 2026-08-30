import { describe, it, expect } from "vitest";
import { forSpeech } from "../speak";

/**
 * What the narrator says, as opposed to what the screen shows.
 *
 * These transformations are the difference between a question a struggling
 * reader can follow and a stream of noise. Several speech engines read "**"
 * aloud as the word "asterisk", in the middle of the number the emphasis was
 * marking, and most skip mathematical symbols in silence — so "12 ÷ 4" is
 * read as "twelve four", which is not the question.
 */
describe("preparing text for narration", () => {
  it("strips markdown emphasis rather than reading it out", () => {
    expect(forSpeech("Round **47** to the nearest ten.")).toBe(
      "Round 47 to the nearest ten.",
    );
  });

  it("speaks the operations that would otherwise be silent", () => {
    expect(forSpeech("12 ÷ 4")).toBe("12 divided by 4");
    expect(forSpeech("6 × 7")).toBe("6 times 7");
    expect(forSpeech("90 − 25")).toBe("90 minus 25");
  });

  it("reads a fraction as a fraction", () => {
    // "3/4" said as "three four" is two numbers, not one.
    expect(forSpeech("3/4 of a cup")).toBe("3 over 4 of a cup");
  });

  it("speaks units that are written as symbols", () => {
    expect(forSpeech("128°")).toBe("128 degrees");
    expect(forSpeech("25¢")).toBe("25 cents");
    expect(forSpeech("$14")).toBe("14 dollars");
  });

  it("reads inequality signs as words", () => {
    expect(forSpeech("h ≥ 40")).toBe("h is greater than or equal to 40");
    expect(forSpeech("p ≤ 12")).toBe("p is less than or equal to 12");
  });

  it("leaves ordinary prose alone", () => {
    const prose = "Who are the main characters in this story?";
    expect(forSpeech(prose)).toBe(prose);
  });
});

/*
 * Clip naming moved to clips.test.ts, along with the rule these tests used
 * to get wrong. They asserted that a URL always comes back, which was the
 * behaviour that broke the passage read-aloud button: a path to a file that
 * does not exist is not better than no path, it is worse, because the player
 * waits on it for ever.
 */

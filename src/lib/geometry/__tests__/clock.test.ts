import { describe, it, expect } from "vitest";
import {
  angleFromPoint,
  digitalTime,
  handAngles,
  hourFromAngle,
  minuteFromAngle,
  polar,
  spokenTime,
} from "../clock";

describe("clock geometry", () => {
  it("puts the hands where they belong at the landmark times", () => {
    expect(handAngles(12, 0)).toEqual({ hour: 0, minute: 0 });
    expect(handAngles(3, 0)).toEqual({ hour: 90, minute: 0 });
    expect(handAngles(6, 0)).toEqual({ hour: 180, minute: 0 });
    expect(handAngles(9, 0)).toEqual({ hour: 270, minute: 0 });
  });

  it("moves the hour hand continuously, not in jumps", () => {
    // At 3:30 the hour hand sits halfway between 3 and 4. A hand that stayed
    // on the 3 would teach a child to misread every "half past" and
    // "quarter to" on the test.
    expect(handAngles(3, 30).hour).toBe(105);
    expect(handAngles(3, 45).hour).toBe(112.5);
    expect(handAngles(11, 59).hour).toBeCloseTo(359.5, 5);
  });

  it("places 12 o'clock at the top of the dial", () => {
    const top = polar(0, 40);
    expect(top.x).toBeCloseTo(50, 5);
    expect(top.y).toBeCloseTo(10, 5);

    const right = polar(90, 40);
    expect(right.x).toBeCloseTo(90, 5);
    expect(right.y).toBeCloseTo(50, 5);
  });

  it("round-trips a point back to its angle", () => {
    // Tolerance is 2 decimals rather than 4 because polar() rounds its output
    // to three decimals to keep server and client rendering byte-identical.
    // The residual error is under a hundredth of a degree, which is far below
    // anything visible on a 224px dial.
    for (const angle of [0, 30, 90, 180, 270, 359]) {
      const p = polar(angle, 40);
      expect(angleFromPoint(p.x, p.y)).toBeCloseTo(angle, 2);
    }
  });

  it("snaps a dragged minute hand to five-minute steps", () => {
    // MA.2.M.2.1 works to the nearest five minutes, so the manipulative must
    // not let a child set 3:37 and then be marked wrong for reading 3:35.
    expect(minuteFromAngle(0)).toBe(0);
    expect(minuteFromAngle(90)).toBe(15);
    expect(minuteFromAngle(180)).toBe(30);
    expect(minuteFromAngle(270)).toBe(45);
    // 37 minutes' worth of angle snaps to 35.
    expect(minuteFromAngle(37 * 6)).toBe(35);
    // 38 minutes' worth rounds up to 40.
    expect(minuteFromAngle(38 * 6)).toBe(40);
  });

  it("wraps the minute hand round the top rather than reaching 60", () => {
    expect(minuteFromAngle(359)).toBe(0);
    expect(minuteFromAngle(358)).toBe(0);
  });

  it("reads the hour hand as 12 rather than 0", () => {
    expect(hourFromAngle(0)).toBe(12);
    expect(hourFromAngle(30)).toBe(1);
    expect(hourFromAngle(359)).toBe(12);
  });

  it("uses the landmark phrases the benchmark names", () => {
    expect(spokenTime(3, 0)).toBe("3 o'clock");
    expect(spokenTime(3, 15)).toBe("quarter past 3");
    expect(spokenTime(3, 30)).toBe("half past 3");
    expect(spokenTime(3, 45)).toBe("quarter to 4");
    expect(spokenTime(3, 10)).toBe("10 minutes past 3");
    expect(spokenTime(3, 50)).toBe("10 minutes to 4");
  });

  it("rolls the hour over correctly when speaking a time near twelve", () => {
    expect(spokenTime(12, 45)).toBe("quarter to 1");
    expect(spokenTime(12, 50)).toBe("10 minutes to 1");
  });

  it("pads the digital reading", () => {
    expect(digitalTime(3, 5)).toBe("3:05");
    expect(digitalTime(12, 0)).toBe("12:00");
  });
});

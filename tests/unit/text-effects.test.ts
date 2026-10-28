import { describe, expect, it } from "vitest";

import { decodeFrame } from "@/lib/decode";
import { formatSyslogTimestamp, syslogLine } from "@/lib/syslog";
import {
  INITIAL_TYPEWRITER_STATE,
  nextTypewriterState,
  TYPEWRITER_DELAYS,
  type TypewriterState,
} from "@/lib/typewriter";

const alwaysZero = () => 0;

describe("decodeFrame", () => {
  it("scrambles every letter at the start and keeps spaces", () => {
    const cells = decodeFrame("Ya s", 0, alwaysZero);
    expect(cells.map((cell) => cell.settled)).toEqual([false, false, true, false]);
    expect(cells[0]?.char).toBe("A");
  });

  it("settles letters left to right and fully at progress 1", () => {
    const halfway = decodeFrame("Abdullah", 0.6, alwaysZero).map((cell) => cell.settled);
    expect(halfway.indexOf(false)).toBeGreaterThan(0);
    expect(halfway.slice(halfway.indexOf(false)).every((settled) => !settled)).toBe(true);
    expect(
      decodeFrame("Abdullah", 1, alwaysZero)
        .map((cell) => cell.char)
        .join(""),
    ).toBe("Abdullah");
  });

  it("staggers a second line after the first", () => {
    const first = decodeFrame("Yasir", 0.5, alwaysZero, { offset: 0, total: 13 });
    const second = decodeFrame("Abdullah", 0.5, alwaysZero, { offset: 5, total: 13 });
    expect(first.filter((cell) => cell.settled).length).toBeGreaterThan(
      second.filter((cell) => cell.settled).length,
    );
  });
});

describe("nextTypewriterState", () => {
  const words = ["Hi", "Yo"];

  function run(steps: number): TypewriterState {
    let state = INITIAL_TYPEWRITER_STATE;
    for (let i = 0; i < steps; i += 1) state = nextTypewriterState(state, words).state;
    return state;
  }

  it("types, holds, deletes and moves to the next word", () => {
    expect(run(2)).toEqual({ index: 0, length: 2, phase: "holding" });
    expect(run(3)).toEqual({ index: 0, length: 2, phase: "deleting" });
    expect(run(5)).toEqual({ index: 1, length: 0, phase: "typing" });
  });

  it("waits longest while holding a finished word", () => {
    const holding = nextTypewriterState({ index: 0, length: 1, phase: "typing" }, words);
    expect(holding.delay).toBe(TYPEWRITER_DELAYS.hold);
  });

  it("wraps back to the first word", () => {
    expect(run(10)).toEqual({ index: 0, length: 0, phase: "typing" });
  });
});

describe("syslog", () => {
  const date = new Date("2026-10-24T17:44:05.123Z");

  it("formats Cisco-style timestamps in IST", () => {
    expect(formatSyslogTimestamp(date)).toBe("*Oct 24 23:14:05.123");
  });

  it("prefixes the message with the timestamp", () => {
    expect(syslogLine(date, "%SYS-5-CONFIG_I: Configured from console by console")).toBe(
      "*Oct 24 23:14:05.123: %SYS-5-CONFIG_I: Configured from console by console",
    );
  });
});

import { describe, expect, it } from "vitest";

import { CREDENTIALS } from "@/lib/content/credentials";
import { EXPERIENCE } from "@/lib/content/experience";
import { buildTimeline, formatPeriod } from "@/lib/timeline";

describe("formatPeriod", () => {
  it("formats ranges, single years and current roles", () => {
    expect(formatPeriod(2024, 2027)).toBe("2024–2027");
    expect(formatPeriod(2024, 2024)).toBe("2024");
    expect(formatPeriod(2024, null, true)).toBe("2024–present");
    expect(formatPeriod(null, 2027)).toBe("2027");
  });

  it("returns null when no dates are known", () => {
    expect(formatPeriod(null, null)).toBeNull();
  });
});

describe("buildTimeline", () => {
  it("lists experience first, then credentials, hiding unknown dates", () => {
    const timeline = buildTimeline(EXPERIENCE, CREDENTIALS);
    expect(timeline.map((entry) => entry.heading)).toEqual([
      "Earthix Software Solutions Pvt. Ltd.",
      "Cyfuture India",
      "Bachelor of Computer Applications (BCA)",
      "Cisco CCNA training",
    ]);
    expect(timeline[3]?.detail).toBe("DUCAT");
    expect(timeline[0]?.period).toBeNull();
    expect(timeline[2]?.period).toBe("2024–2027");
  });
});

import { describe, expect, it } from "vitest";

import { formatPairs, list, optionalInt, pairs, slugify, toDateInput } from "@/lib/admin/form-data";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { messageSchema } from "@/lib/validation/message";

function form(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

describe("password hashing", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).toMatch(/^scrypt:[\w-]+:[\w-]+$/);
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("correct horse battery stapler", hash)).toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("same password here")).not.toBe(
      await hashPassword("same password here"),
    );
  });

  it("rejects malformed stored values", async () => {
    expect(await verifyPassword("anything", "")).toBe(false);
    expect(await verifyPassword("anything", "bcrypt:abc:def")).toBe(false);
  });
});

describe("admin form readers", () => {
  it("splits lists on lines and commas", () => {
    expect(list(form({ stack: "Next.js, React\n\nPostgreSQL " }), "stack")).toEqual([
      "Next.js",
      "React",
      "PostgreSQL",
    ]);
  });

  it("round-trips title :: body pairs", () => {
    const items = pairs(form({ p: "Write it down :: A fix not written down :: is lost\n" }), "p");
    expect(items).toEqual([{ title: "Write it down", body: "A fix not written down :: is lost" }]);
    expect(formatPairs(items)).toBe("Write it down :: A fix not written down :: is lost");
  });

  it("reads optional integers", () => {
    expect(optionalInt(form({ n: "" }), "n")).toBeNull();
    expect(optionalInt(form({ n: "2024" }), "n")).toBe(2024);
    expect(optionalInt(form({ n: "3.5" }), "n")).toBeNaN();
  });

  it("formats dates in IST for date inputs", () => {
    expect(toDateInput(new Date("2026-10-27T20:00:00Z"))).toBe("2026-10-28");
    expect(toDateInput(null)).toBe("");
  });

  it("makes URL-safe slugs", () => {
    expect(slugify("  VLANs on One Office Floor! ")).toBe("vlans-on-one-office-floor");
  });
});

describe("contact message validation", () => {
  const valid = {
    name: "Priya Sharma",
    email: "priya@example.com",
    topic: "HIRING",
    body: "We are hiring a network support engineer in Noida.",
  };

  it("accepts a complete message", () => {
    expect(messageSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a bad email, an unknown topic and a short body", () => {
    const result = messageSchema.safeParse({ ...valid, email: "nope", topic: "SPAM", body: "hi" });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["email", "topic", "body"]));
  });
});

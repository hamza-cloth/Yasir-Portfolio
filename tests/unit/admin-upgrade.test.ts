import { describe, expect, it } from "vitest";

import { describeDevice } from "@/lib/admin/device";
import { can } from "@/lib/admin/roles";
import { countryCode, deviceType, referrerSource } from "@/lib/analytics";
import {
  base32Decode,
  base32Encode,
  generateBackupCodes,
  hashBackupCode,
  totpCode,
  verifyTotp,
} from "@/lib/auth/totp";
import { parseSiteConfig, SITE_CONFIG } from "@/lib/site-config";

const CHROME_WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";
const SAFARI_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const EDGE_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36 Edg/141.0";
const IPAD =
  "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

describe("describeDevice", () => {
  it("names the browser and system", () => {
    expect(describeDevice(CHROME_WINDOWS)).toBe("Chrome on Windows");
    expect(describeDevice(SAFARI_IPHONE)).toBe("Safari on iOS");
    expect(describeDevice(EDGE_MAC)).toBe("Edge on macOS");
  });

  it("copes with nothing", () => {
    expect(describeDevice(null)).toBe("Unknown device");
    expect(describeDevice("curl/8.0")).toBe("Unknown device");
  });
});

describe("analytics buckets", () => {
  it("keeps only the referring host, and drops links from the site itself", () => {
    expect(referrerSource("https://www.google.com/search?q=yasir", "yasir.dev")).toBe("google.com");
    expect(referrerSource("https://yasir.dev/work", "yasir.dev")).toBeNull();
    expect(referrerSource("http://localhost:3000/", "localhost:3000")).toBeNull();
    expect(referrerSource("", "yasir.dev")).toBe("direct");
    expect(referrerSource(undefined, "yasir.dev")).toBe("direct");
    expect(referrerSource("not a url", "yasir.dev")).toBe("direct");
  });

  it("sorts devices into three kinds", () => {
    expect(deviceType(CHROME_WINDOWS)).toBe("desktop");
    expect(deviceType(SAFARI_IPHONE)).toBe("mobile");
    expect(deviceType(IPAD)).toBe("tablet");
    expect(deviceType(null)).toBe("desktop");
  });

  it("accepts only two-letter country codes", () => {
    expect(countryCode("IN")).toBe("IN");
    expect(countryCode("XX")).toBe("unknown");
    expect(countryCode("india")).toBe("unknown");
    expect(countryCode(null)).toBe("unknown");
  });
});

describe("roles", () => {
  it("grants owners everything, editors content, viewers reading", () => {
    expect(can("OWNER", "manage")).toBe(true);
    expect(can("EDITOR", "edit")).toBe(true);
    expect(can("EDITOR", "manage")).toBe(false);
    expect(can("VIEWER", "view")).toBe(true);
    expect(can("VIEWER", "edit")).toBe(false);
    expect(can("ADMIN", "view")).toBe(false);
  });
});

describe("two-factor codes", () => {
  // RFC 6238 test vector: the ASCII secret "12345678901234567890", SHA-1, 8 digits → 94287082 at
  // 59 s; the last 6 digits are what a 6-digit app shows.
  const secret = base32Encode(Buffer.from("12345678901234567890"));

  it("matches the RFC test vector", () => {
    expect(totpCode(secret, 59_000)).toBe("287082");
    expect(base32Decode(secret).toString()).toBe("12345678901234567890");
  });

  it("accepts one step of clock drift either way, and nothing else", () => {
    const now = 1_000_000_000_000;
    expect(verifyTotp(secret, totpCode(secret, now - 30_000), now)).toBe(true);
    expect(verifyTotp(secret, totpCode(secret, now + 30_000), now)).toBe(true);
    expect(verifyTotp(secret, totpCode(secret, now - 90_000), now)).toBe(false);
    expect(verifyTotp(secret, "12345", now)).toBe(false);
  });

  it("hashes backup codes the same with or without the dash and case", () => {
    const [code] = generateBackupCodes(1);
    expect(code).toMatch(/^[0-9a-f]{5}-[0-9a-f]{5}$/);
    expect(hashBackupCode(code!.toUpperCase().replace("-", " "))).toBe(hashBackupCode(code!));
  });
});

describe("site config", () => {
  it("falls back to the defaults for anything invalid", () => {
    expect(parseSiteConfig("appearance", { watermark: "yes" })).toEqual(
      SITE_CONFIG.appearance.defaults,
    );
    expect(parseSiteConfig("sections", { home: ["hero"] })).toEqual(SITE_CONFIG.sections.defaults);
  });

  it("keeps a valid saved value", () => {
    const saved = { home: ["projects", "cta"] };
    expect(parseSiteConfig("sections", saved)).toEqual(saved);
  });
});

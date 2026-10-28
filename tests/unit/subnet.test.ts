import { describe, expect, it } from "vitest";

import {
  calculateSubnet,
  isSubnetError,
  parseIpv4,
  type SubnetResult,
} from "@/lib/subnet";

function subnet(ip: string, prefix: number): SubnetResult {
  const result = calculateSubnet(ip, prefix);
  if (isSubnetError(result)) throw new Error(result.error);
  return result;
}

describe("calculateSubnet", () => {
  it("192.168.10.37/26", () => {
    expect(subnet("192.168.10.37", 26)).toMatchObject({
      network: "192.168.10.0",
      broadcast: "192.168.10.63",
      firstHost: "192.168.10.1",
      lastHost: "192.168.10.62",
      usableHosts: 62,
      mask: "255.255.255.192",
      wildcard: "0.0.0.63",
      addressClass: "C",
      privateRange: "192.168.0.0/16",
    });
  });

  it("172.16.40.200/20", () => {
    expect(subnet("172.16.40.200", 20)).toMatchObject({
      network: "172.16.32.0",
      broadcast: "172.16.47.255",
      firstHost: "172.16.32.1",
      lastHost: "172.16.47.254",
      usableHosts: 4094,
      mask: "255.255.240.0",
      wildcard: "0.0.15.255",
      addressClass: "B",
      privateRange: "172.16.0.0/12",
    });
  });

  it("10.1.2.3/8", () => {
    expect(subnet("10.1.2.3", 8)).toMatchObject({
      network: "10.0.0.0",
      broadcast: "10.255.255.255",
      usableHosts: 16_777_214,
      addressClass: "A",
      privateRange: "10.0.0.0/8",
    });
  });

  it("192.168.1.130/25 lands in the upper half", () => {
    expect(subnet("192.168.1.130", 25)).toMatchObject({
      network: "192.168.1.128",
      broadcast: "192.168.1.255",
      firstHost: "192.168.1.129",
      lastHost: "192.168.1.254",
      usableHosts: 126,
    });
  });

  it("a /30 link has two usable hosts", () => {
    expect(subnet("10.0.12.2", 30)).toMatchObject({
      network: "10.0.12.0",
      broadcast: "10.0.12.3",
      firstHost: "10.0.12.1",
      lastHost: "10.0.12.2",
      usableHosts: 2,
    });
  });

  it("/31 uses both addresses and has no broadcast (RFC 3021)", () => {
    expect(subnet("10.0.0.5", 31)).toMatchObject({
      network: "10.0.0.4",
      broadcast: null,
      firstHost: "10.0.0.4",
      lastHost: "10.0.0.5",
      usableHosts: 2,
      totalAddresses: 2,
    });
  });

  it("/32 is a single host", () => {
    expect(subnet("203.0.113.7", 32)).toMatchObject({
      network: "203.0.113.7",
      broadcast: null,
      firstHost: "203.0.113.7",
      lastHost: "203.0.113.7",
      usableHosts: 1,
      mask: "255.255.255.255",
      wildcard: "0.0.0.0",
      privateRange: null,
    });
  });

  it("/0 covers every address", () => {
    expect(subnet("8.8.8.8", 0)).toMatchObject({
      network: "0.0.0.0",
      broadcast: "255.255.255.255",
      firstHost: "0.0.0.1",
      lastHost: "255.255.255.254",
      usableHosts: 4_294_967_294,
      mask: "0.0.0.0",
      wildcard: "255.255.255.255",
    });
  });

  it("does not treat 172.32.x.x as private", () => {
    expect(subnet("172.32.0.1", 16).privateRange).toBeNull();
    expect(subnet("172.31.255.255", 16).privateRange).toBe("172.16.0.0/12");
  });

  it("reports classes D and E", () => {
    expect(subnet("224.0.0.5", 32).addressClass).toBe("D");
    expect(subnet("240.0.0.1", 4).addressClass).toBe("E");
  });

  it("returns binary with the address and mask in dotted octets", () => {
    const result = subnet("192.168.10.37", 26);
    expect(result.binaryAddress).toBe("11000000.10101000.00001010.00100101");
    expect(result.binaryMask).toBe("11111111.11111111.11111111.11000000");
  });

  it("rejects bad input", () => {
    expect(isSubnetError(calculateSubnet("256.1.1.1", 24))).toBe(true);
    expect(isSubnetError(calculateSubnet("10.1.1", 24))).toBe(true);
    expect(isSubnetError(calculateSubnet("10.1.1.1", 33))).toBe(true);
    expect(isSubnetError(calculateSubnet("10.1.1.1", 24.5))).toBe(true);
    expect(isSubnetError(calculateSubnet(" 10.1.1.1 ", 24))).toBe(false);
  });
});

describe("parseIpv4", () => {
  it("rejects signs, blanks and extra octets", () => {
    expect(parseIpv4("1.2.3.-4")).toBeNull();
    expect(parseIpv4("1..2.3")).toBeNull();
    expect(parseIpv4("1.2.3.4.5")).toBeNull();
    expect(parseIpv4("0.0.0.0")).toBe(0);
  });
});

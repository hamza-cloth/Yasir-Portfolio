export type AddressClass = "A" | "B" | "C" | "D" | "E";

export type SubnetResult = {
  address: string;
  prefix: number;
  network: string;
  // Null for /31 and /32, which have no broadcast address.
  broadcast: string | null;
  firstHost: string;
  lastHost: string;
  usableHosts: number;
  totalAddresses: number;
  mask: string;
  wildcard: string;
  addressClass: AddressClass;
  privateRange: string | null;
  binaryAddress: string;
  binaryMask: string;
};

export type SubnetError = { error: string };

const PRIVATE_RANGES = [
  { range: "10.0.0.0/8", base: toInt([10, 0, 0, 0]), prefix: 8 },
  { range: "172.16.0.0/12", base: toInt([172, 16, 0, 0]), prefix: 12 },
  { range: "192.168.0.0/16", base: toInt([192, 168, 0, 0]), prefix: 16 },
];

function toInt(octets: number[]): number {
  return octets.reduce((value, octet) => ((value << 8) | octet) >>> 0, 0);
}

export function intToIp(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}

export function parseIpv4(input: string): number | null {
  const parts = input.trim().split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map((part) => (/^\d{1,3}$/.test(part) ? Number(part) : NaN));
  if (octets.some((octet) => Number.isNaN(octet) || octet > 255)) return null;
  return toInt(octets);
}

export function prefixToMask(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

function toBinary(value: number): string {
  return [24, 16, 8, 0]
    .map((shift) => ((value >>> shift) & 255).toString(2).padStart(8, "0"))
    .join(".");
}

function addressClass(value: number): AddressClass {
  const first = value >>> 24;
  if (first < 128) return "A";
  if (first < 192) return "B";
  if (first < 224) return "C";
  if (first < 240) return "D";
  return "E";
}

function privateRange(value: number): string | null {
  const match = PRIVATE_RANGES.find(
    ({ base, prefix }) => ((value & prefixToMask(prefix)) >>> 0) === base,
  );
  return match?.range ?? null;
}

export function calculateSubnet(ip: string, prefix: number): SubnetResult | SubnetError {
  const address = parseIpv4(ip);
  if (address === null) return { error: "Enter an IPv4 address like 192.168.10.37." };
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return { error: "The prefix must be a whole number from 0 to 32." };
  }

  const mask = prefixToMask(prefix);
  const wildcard = ~mask >>> 0;
  const network = (address & mask) >>> 0;
  const last = (network | wildcard) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);

  // RFC 3021: a /31 point-to-point link uses both addresses; a /32 is a single host.
  const pointToPoint = prefix >= 31;
  const firstHost = pointToPoint ? network : network + 1;
  const lastHost = pointToPoint ? last : last - 1;

  return {
    address: intToIp(address),
    prefix,
    network: intToIp(network),
    broadcast: pointToPoint ? null : intToIp(last),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    usableHosts: pointToPoint ? totalAddresses : totalAddresses - 2,
    totalAddresses,
    mask: intToIp(mask),
    wildcard: intToIp(wildcard),
    addressClass: addressClass(address),
    privateRange: privateRange(address),
    binaryAddress: toBinary(address),
    binaryMask: toBinary(mask),
  };
}

export function isSubnetError(result: SubnetResult | SubnetError): result is SubnetError {
  return "error" in result;
}

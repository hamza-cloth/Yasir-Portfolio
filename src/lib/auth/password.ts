import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const PREFIX = "scrypt";

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

// Stored as "scrypt:<salt>:<key>" in base64url. No "$", which Next's .env loader would expand.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return [PREFIX, salt.toString("base64url"), key.toString("base64url")].join(":");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [prefix, salt, key] = stored.split(":");
  if (prefix !== PREFIX || !salt || !key) return false;

  const expected = Buffer.from(key, "base64url");
  const actual = await derive(password, Buffer.from(salt, "base64url"));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

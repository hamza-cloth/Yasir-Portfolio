import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";

// argon2id with the OWASP-recommended baseline (19 MiB, 2 passes).
const ARGON2_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

// The PHC string ("$argon2id$v=19$…") is stored base64url-encoded behind "argon2:", because
// Next's .env loader would read each "$…" as a variable and corrupt the hash.
const ARGON2_PREFIX = "argon2:";
const SCRYPT_PREFIX = "scrypt";
const SCRYPT_KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const phc = await argon2Hash(password, ARGON2_OPTIONS);
  return ARGON2_PREFIX + Buffer.from(phc).toString("base64url");
}

function deriveScrypt(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, SCRYPT_KEY_LENGTH, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

// Also accepts the older "scrypt:<salt>:<key>" hashes, so an existing password keeps working.
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    if (stored.startsWith(ARGON2_PREFIX)) {
      const phc = Buffer.from(stored.slice(ARGON2_PREFIX.length), "base64url").toString();
      return await argon2Verify(phc, password);
    }

    const [prefix, salt, key] = stored.split(":");
    if (prefix !== SCRYPT_PREFIX || !salt || !key) return false;
    const expected = Buffer.from(key, "base64url");
    const actual = await deriveScrypt(password, Buffer.from(salt, "base64url"));
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

// Exposed for tests of the legacy path.
export async function hashPasswordScrypt(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveScrypt(password, salt);
  return [SCRYPT_PREFIX, salt.toString("base64url"), key.toString("base64url")].join(":");
}

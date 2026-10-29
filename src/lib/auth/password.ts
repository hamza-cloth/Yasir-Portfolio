import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";

// argon2id with the OWASP-recommended baseline (19 MiB, 2 passes).
const ARGON2_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

// The PHC string ("$argon2id$v=19$…") is stored base64url-encoded behind "argon2:", so the value
// survives any tool that reads "$…" as a variable.
const ARGON2_PREFIX = "argon2:";

export async function hashPassword(password: string): Promise<string> {
  const phc = await argon2Hash(password, ARGON2_OPTIONS);
  return ARGON2_PREFIX + Buffer.from(phc).toString("base64url");
}

// argon2's verify compares in constant time; anything that is not an argon2 hash fails.
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith(ARGON2_PREFIX)) return false;
  try {
    const phc = Buffer.from(stored.slice(ARGON2_PREFIX.length), "base64url").toString();
    return await argon2Verify(phc, password);
  } catch {
    return false;
  }
}

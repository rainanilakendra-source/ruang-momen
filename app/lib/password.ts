import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 131072;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_MAX_MEMORY = 256 * 1024 * 1024;
const HASH_VERSION = "scrypt";

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number; maxmem: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, key) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await deriveKey(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAX_MEMORY,
  });

  return [
    HASH_VERSION,
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [version, nValue, rValue, pValue, saltValue, hashValue, extra] =
    storedHash.split("$");
  const N = Number(nValue);
  const r = Number(rValue);
  const p = Number(pValue);

  if (
    version !== HASH_VERSION ||
    extra !== undefined ||
    N !== SCRYPT_N ||
    r !== SCRYPT_R ||
    p !== SCRYPT_P ||
    !saltValue ||
    !hashValue
  ) {
    return false;
  }

  try {
    const expectedHash = Buffer.from(hashValue, "base64url");

    if (expectedHash.length !== SCRYPT_KEY_LENGTH) {
      return false;
    }

    const actualHash = await deriveKey(
      password,
      Buffer.from(saltValue, "base64url"),
      expectedHash.length,
      { N, r, p, maxmem: SCRYPT_MAX_MEMORY },
    );

    return timingSafeEqual(actualHash, expectedHash);
  } catch {
    return false;
  }
}

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPassword: string) {
  const [salt, hash] = storedPassword.split(":");

  if (!salt || !hash) {
    return false;
  }

  const hashBuffer = Buffer.from(hash, "hex");
  const candidateBuffer = scryptSync(password, salt, 64);

  return (
    hashBuffer.length === candidateBuffer.length && timingSafeEqual(hashBuffer, candidateBuffer)
  );
}

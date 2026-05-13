import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const ADMIN_COOKIE = "arunands_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

export function getPrimaryAdminId() {
  return process.env.ADMIN_EMAIL ?? process.env.ADMIN_ID ?? "arunand@avation";
}

export function getPrimaryAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "arunand@123";
}

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "local-arunands-admin-session-secret"
  );
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isPrimaryAdminId(adminId: string) {
  return safeCompare(adminId.trim().toLowerCase(), getPrimaryAdminId().trim().toLowerCase());
}

export async function isAdminCredential(adminId: string, password: string) {
  const normalizedAdminId = adminId.trim().toLowerCase();

  return (
    safeCompare(normalizedAdminId, getPrimaryAdminId().trim().toLowerCase()) &&
    safeCompare(password, getPrimaryAdminPassword())
  );
}

export function createAdminToken() {
  const payload = JSON.stringify({
    role: "admin",
    issuedAt: Date.now(),
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAdminToken(token?: string) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || !safeCompare(signature, sign(payload))) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      role?: string;
      issuedAt?: number;
    };

    return (
      parsed.role === "admin" &&
      typeof parsed.issuedAt === "number" &&
      Date.now() - parsed.issuedAt < SESSION_MAX_AGE * 1000
    );
  } catch {
    return false;
  }
}

export async function isAdminSignedIn() {
  const cookieStore = await cookies();

  return verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.ADMIN_COOKIE_SECURE === "true",
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_COOKIE);
}

export { ADMIN_COOKIE };

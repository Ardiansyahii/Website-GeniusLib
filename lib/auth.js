import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const { JWT_SECRET = "dev-secret", JWT_EXPIRES_IN = "7d" } = process.env;

export function signAuthToken(payload) {
  return jwt.sign(
    { id: payload.id, role: payload.role, email: payload.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyAuthToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const headerToken = request?.headers
    ?.get("authorization")
    ?.replace("Bearer ", "");
  if (headerToken) return headerToken;

  if (typeof cookies === "function") {
    const cookieStore = cookies();
    const cookieToken = cookieStore.get("token")?.value;
    if (cookieToken) return cookieToken;
  }

  const rawCookie = request?.headers?.get("cookie") || "";
  const match = rawCookie.match(/token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAuthUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyAuthToken(token);
}

export function ensureRole(user, allowedRoles = []) {
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    throw new Error("FORBIDDEN");
  }
}


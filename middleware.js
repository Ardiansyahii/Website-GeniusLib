import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/favicon.ico",
  "/api/auth/login",
  "/api/auth/register",
];

const ROLE_GUARDS = [
  { prefix: "/api/admin", roles: ["admin"] },
  { prefix: "/api/petugas", roles: ["admin", "petugas"] },
  { prefix: "/api/transactions", roles: ["admin", "petugas", "siswa"] },
  { prefix: "/api/books/add", roles: ["admin", "petugas"] },
  { prefix: "/api/books/update", roles: ["admin", "petugas"] },
  { prefix: "/api/books/borrow", roles: ["siswa"] },
  { prefix: "/api/books", roles: ["admin", "petugas", "siswa"] },
  { prefix: "/dashboard", roles: ["admin", "petugas", "siswa"] },
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const user = verifyAuthToken(token);

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const guard = ROLE_GUARDS.find(({ prefix }) => pathname.startsWith(prefix));
  if (guard && !guard.roles.includes(user.role)) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|public|api/public).*)"],
};


import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getAuthUser, ensureRole } from "@/lib/auth";

const ALLOWED_ROLES = ["siswa", "petugas", "admin"];

export async function POST(req) {
  const actor = getAuthUser(req);
  try {
    ensureRole(actor, ["admin"]);
    const { name, email, password, role = "siswa" } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Semua field harus diisi" }, { status: 400 });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ message: "Role tidak valid" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, role]
    );

    return NextResponse.json({ message: "User berhasil ditambahkan" });
  } catch (err) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Terjadi kesalahan", error: err.message }, { status: 500 });
  }
}
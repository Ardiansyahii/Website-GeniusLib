import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = params;
  const [rows] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [id]);
  if (rows.length === 0) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, email, password, role } = body;

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await db.query("UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?", [name, email, hashed, role, id]);
    } else {
      await db.query("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?", [name, email, role, id]);
    }

    return NextResponse.json({ message: "User diperbarui" });
  } catch (err) {
    return NextResponse.json({ message: "Terjadi kesalahan", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  await db.query("DELETE FROM users WHERE id = ?", [id]);
  return NextResponse.json({ message: "User dihapus" });
}

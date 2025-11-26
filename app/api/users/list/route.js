import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Mengambil status dan tanggal daftar juga
    const [rows] = await db.query("SELECT id, name, email, role, status, class_name, created_at FROM users ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ message: "Gagal mengambil data users" }, { status: 500 });
  }
}
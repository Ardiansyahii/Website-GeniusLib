import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, ensureRole } from "@/lib/auth";

export async function GET(request) {
  const actor = getAuthUser(request);
  try {
    ensureRole(actor, ["admin", "petugas"]);
    const [rows] = await db.query(
      `SELECT t.id, t.user_id, u.name as user_name, t.book_id, b.title as book_title, t.status, t.borrowed_at, t.returned_at
       FROM transactions t
       LEFT JOIN users u ON u.id = t.user_id
       LEFT JOIN books b ON b.id = t.book_id
       ORDER BY t.borrowed_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

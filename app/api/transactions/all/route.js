import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, ensureRole } from "@/lib/auth";

export async function GET(request) {
  const actor = getAuthUser(request);
  try {
    ensureRole(actor, ["admin", "petugas"]);
    // Join tabel transactions + users + books
    // Urutkan dari yang terbaru (request_date DESC)
    const query = `
      SELECT 
        t.id, 
        t.status, 
        t.request_date, 
        t.pickup_date, 
        t.due_date, 
        t.return_date,
        u.name as user_name, 
        u.class_name,
        b.title as book_title,
        b.cover_image
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN books b ON t.book_id = b.id
      ORDER BY t.request_date DESC
    `;
    
    const [rows] = await db.query(query);
    return NextResponse.json(rows);
  } catch (err) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ message: "Gagal mengambil data transaksi" }, { status: 500 });
  }
}
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, ensureRole } from "@/lib/auth";
import { logTransactionAction } from "@/lib/audit";

export async function POST(req) {
  const actor = getAuthUser(req);
  try {
    ensureRole(actor, ["admin", "petugas"]);
    const { user_id, book_id } = await req.json();
    if (!user_id || !book_id) {
      return NextResponse.json(
        { message: "user_id dan book_id diperlukan" },
        { status: 400 }
      );
    }

    const [book] = await db.query("SELECT id FROM books WHERE id = ?", [
      book_id,
    ]);
    if (book.length === 0) {
      return NextResponse.json(
        { message: "Buku tidak ditemukan" },
        { status: 404 }
      );
    }

    const [result] = await db.query(
      "INSERT INTO transactions (user_id, book_id, status, request_date) VALUES (?, ?, 'pending', NOW())",
      [user_id, book_id]
    );

    await logTransactionAction({
      transactionId: result.insertId,
      actorId: actor.id,
      actorRole: actor.role,
      action: "create",
      notes: "Transaksi dibuat manual oleh petugas/admin",
    });

    return NextResponse.json({ message: "Transaksi dibuat" });
  } catch (err) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan", error: err.message },
      { status: 500 }
    );
  }
}

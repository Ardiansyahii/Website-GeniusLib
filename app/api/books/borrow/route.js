import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, ensureRole } from "@/lib/auth";
import { logTransactionAction } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";

export async function POST(req) {
  const actor = getAuthUser(req);
  try {
    ensureRole(actor, ["siswa"]);
    const { bookId } = await req.json();

    if (!bookId) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const [book] = await db.query("SELECT stock, title FROM books WHERE id = ?", [
      bookId,
    ]);
    if (book.length === 0 || book[0].stock <= 0) {
      return NextResponse.json(
        { message: "Stok buku habis" },
        { status: 400 }
      );
    }

    const [existing] = await db.query(
      "SELECT id FROM transactions WHERE user_id = ? AND book_id = ? AND status IN ('pending', 'approved', 'borrowed', 'return_pending')",
      [actor.id, bookId]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Anda sedang meminjam atau mengajukan buku ini" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "INSERT INTO transactions (user_id, book_id, status, request_date) VALUES (?, ?, 'pending', NOW())",
      [actor.id, bookId]
    );

    await logTransactionAction({
      transactionId: result.insertId,
      actorId: actor.id,
      actorRole: actor.role,
      action: "borrow_request",
      notes: `Pengajuan pinjam buku ${book[0].title}`,
    });

    await sendNotification({
      to: process.env.LIBRARY_EMAIL,
      subject: "Permintaan peminjaman baru",
      text: `${actor.email} mengajukan peminjaman untuk buku ${book[0].title}`,
    });

    return NextResponse.json({
      message: "Permintaan peminjaman berhasil diajukan",
    });
  } catch (err) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT 
        t.id,
        t.user_id,
        t.book_id,
        t.status,
        t.request_date,
        t.pickup_date,
        t.due_date,
        t.return_date,
        u.name AS user_name,
        u.class_name,
        b.title AS book_title,
        b.stock
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      JOIN books b ON b.id = t.book_id
      ORDER BY t.request_date DESC`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("PETUGAS TRANSACTIONS GET ERROR:", error);
    return NextResponse.json(
      { message: "Kesalahan server saat mengambil data transaksi." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { transactionId, status: nextStatus, bookId } = await request.json();

    if (!transactionId || !nextStatus) {
      return NextResponse.json(
        { message: "transactionId dan status wajib diisi." },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      "SELECT id, status, book_id FROM transactions WHERE id = ?",
      [transactionId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    const current = rows[0];
    const effectiveBookId = bookId || current.book_id;

    const disallowed =
      (current.status === "pending" &&
        !["approved", "rejected"].includes(nextStatus)) ||
      (current.status === "return_pending" && nextStatus !== "returned") ||
      (current.status === "approved" && nextStatus === "rejected");

    if (disallowed) {
      return NextResponse.json(
        {
          message: `Transisi status ${current.status} -> ${nextStatus} tidak didukung.`,
        },
        { status: 400 }
      );
    }

    if (nextStatus === "approved" && effectiveBookId) {
      await db.query(
        "UPDATE books SET stock = stock - 1 WHERE id = ? AND stock > 0",
        [effectiveBookId]
      );
    }

    if (nextStatus === "returned" && effectiveBookId) {
      await db.query("UPDATE books SET stock = stock + 1 WHERE id = ?", [
        effectiveBookId,
      ]);
      await db.query("UPDATE transactions SET return_date = NOW() WHERE id = ?", [
        transactionId,
      ]);
    }

    if (nextStatus === "borrowed") {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      await db.query(
        "UPDATE transactions SET status = ?, pickup_date = NOW(), due_date = ? WHERE id = ?",
        [nextStatus, dueDate, transactionId]
      );
    } else {
      await db.query("UPDATE transactions SET status = ? WHERE id = ?", [
        nextStatus,
        transactionId,
      ]);
    }

    return NextResponse.json({ message: "Status transaksi diperbarui" });
  } catch (error) {
    console.error("PETUGAS TRANSACTIONS PUT ERROR:", error);
    return NextResponse.json(
      { message: "Kesalahan server saat memperbarui status." },
      { status: 500 }
    );
  }
}
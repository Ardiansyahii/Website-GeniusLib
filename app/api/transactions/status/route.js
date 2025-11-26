import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, ensureRole } from "@/lib/auth";
import { logTransactionAction } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";

export async function PUT(req) {
  const actor = getAuthUser(req);
  try {
    ensureRole(actor, ["admin", "petugas"]);

    const { transactionId, status } = await req.json();

    if (!transactionId || !status) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const [[transaction]] = await db.query(
      `SELECT t.id, t.status, t.book_id, t.user_id, u.email, u.name, b.title
       FROM transactions t
       JOIN users u ON u.id = t.user_id
       JOIN books b ON b.id = t.book_id
       WHERE t.id = ?`,
      [transactionId]
    );

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (status === "approved") {
      try {
        await db.query("CALL approve_transaction(?)", [transactionId]);
      } catch (error) {
        console.warn("CALL approve_transaction failed, fallback:", error);
        await db.query("UPDATE books SET stock = stock - 1 WHERE id = ?", [
          transaction.book_id,
        ]);
        await db.query("UPDATE transactions SET status = 'approved' WHERE id = ?", [
          transactionId,
        ]);
      }
    } else if (status === "returned") {
      await db.query("UPDATE books SET stock = stock + 1 WHERE id = ?", [
        transaction.book_id,
      ]);
      await db.query(
        "UPDATE transactions SET status = ?, return_date = NOW() WHERE id = ?",
        [status, transactionId]
      );
    } else if (status === "borrowed") {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      await db.query(
        "UPDATE transactions SET status = ?, pickup_date = NOW(), due_date = ? WHERE id = ?",
        [status, dueDate, transactionId]
      );
    } else {
      await db.query("UPDATE transactions SET status = ? WHERE id = ?", [
        status,
        transactionId,
      ]);
    }

    await logTransactionAction({
      transactionId,
      actorId: actor.id,
      actorRole: actor.role,
      action: status,
      notes: `Status diubah menjadi ${status}`,
    });

    await sendNotification({
      to: transaction.email,
      subject: `Status peminjaman "${transaction.title}" diperbarui`,
      text: `Halo ${transaction.name}, status peminjaman Anda kini ${status}.`,
    });

    return NextResponse.json({ message: "Status transaksi diperbarui" });
  } catch (err) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    console.error(err);
    return NextResponse.json(
      { message: "Terjadi kesalahan server", error: err.message },
      { status: 500 }
    );
  }
}
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, ensureRole } from "@/lib/auth";
import { logTransactionAction } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";

export async function PUT(req) {
  const actor = getAuthUser(req);
  try {
    ensureRole(actor, ["siswa"]);
    const { transactionId, action } = await req.json();

    if (!transactionId || !action) {
      return NextResponse.json(
        { message: "Invalid Data" },
        { status: 400 }
      );
    }

    const [[transaction]] = await db.query(
      `SELECT t.id, t.status, t.book_id, b.title
       FROM transactions t
       JOIN books b ON b.id = t.book_id
       WHERE t.id = ? AND t.user_id = ?`,
      [transactionId, actor.id]
    );

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (action === "pickup") {
      if (transaction.status !== "approved") {
        return NextResponse.json(
          { message: "Transaksi belum disetujui." },
          { status: 400 }
        );
      }
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      await db.query(
        `UPDATE transactions 
         SET status = 'borrowed', pickup_date = NOW(), due_date = ?
         WHERE id = ?`,
        [dueDate, transactionId]
      );
    } else if (action === "return_request") {
      if (transaction.status !== "borrowed") {
        return NextResponse.json(
          { message: "Transaksi belum berada di status borrowed." },
          { status: 400 }
        );
      }
      await db.query(
        "UPDATE transactions SET status = 'return_pending' WHERE id = ?",
        [transactionId]
      );
    } else {
      return NextResponse.json(
        { message: "Aksi tidak dikenal" },
        { status: 400 }
      );
    }

    await logTransactionAction({
      transactionId,
      actorId: actor.id,
      actorRole: actor.role,
      action,
      notes: `Siswa melakukan aksi ${action}`,
    });

    await sendNotification({
      to: process.env.LIBRARY_EMAIL,
      subject: `Siswa melakukan aksi ${action}`,
      text: `Transaksi #${transactionId} untuk buku ${transaction.title} mendapatkan aksi ${action}.`,
    });

    return NextResponse.json({ message: "Status berhasil diperbarui" });
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

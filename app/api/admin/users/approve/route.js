import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, ensureRole } from "@/lib/auth";
import { sendNotification } from "@/lib/notifications";

export async function PUT(req) {
  const actor = getAuthUser(req);
  try {
    ensureRole(actor, ["admin"]);
    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    let newStatus;
    if (action === "approve") newStatus = "active";
    else if (action === "reject") newStatus = "rejected";
    else
      return NextResponse.json(
        { message: "Aksi tidak valid" },
        { status: 400 }
      );

    const [[user]] = await db.query(
      "SELECT id, email, name FROM users WHERE id = ?",
      [userId]
    );
    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.query("UPDATE users SET status = ? WHERE id = ?", [
      newStatus,
      userId,
    ]);

    await sendNotification({
      to: user.email,
      subject: `Status akun Anda ${newStatus}`,
      text: `Halo ${user.name}, akun Anda kini berstatus ${newStatus}.`,
    });

    return NextResponse.json({ message: `User berhasil di-${action}` });
  } catch (err) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

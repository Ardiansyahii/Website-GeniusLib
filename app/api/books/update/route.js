import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, ensureRole } from "@/lib/auth";

/**
 * Endpoint untuk memperbarui detail buku.
 * Gunakan method POST agar kompatibel dengan form lama.
 */
export async function POST(request) {
  const actor = getAuthUser(request);
  try {
    ensureRole(actor, ["admin", "petugas"]);

    const body = await request.json();
    const { id, title, author, category, stock } = body || {};

    if (!id || !title || !author || !category || stock === undefined) {
      return NextResponse.json(
        { message: "Data buku tidak lengkap." },
        { status: 400 }
      );
    }

    const numericStock = Number(stock);
    if (Number.isNaN(numericStock) || numericStock < 0) {
      return NextResponse.json(
        { message: "Stok harus berupa angka positif." },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `UPDATE books 
       SET title = ?, author = ?, category = ?, stock = ?
       WHERE id = ?`,
      [title, author, category, numericStock, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: `Buku dengan ID ${id} tidak ditemukan.` },
        { status: 404 }
      );
    }

    const [rows] = await db.query(
      "SELECT id, title, author, category, stock FROM books WHERE id = ?",
      [id]
    );

    return NextResponse.json(
      {
        message: "Buku berhasil diperbarui",
        book: rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("BOOK UPDATE ERROR:", error);
    return NextResponse.json(
      { message: "Gagal memproses permintaan update buku." },
      { status: 500 }
    );
  }
}

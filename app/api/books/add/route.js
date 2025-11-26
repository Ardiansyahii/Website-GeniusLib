import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, ensureRole } from "@/lib/auth";

export async function POST(req) {
  const actor = getAuthUser(req);
  try {
    ensureRole(actor, ["admin", "petugas"]);

    const { title, author, stock = 0 } = await req.json();

    if (!title || !author) {
      return NextResponse.json(
        { message: "Judul dan penulis wajib diisi." },
        { status: 400 }
      );
    }

    const numericStock = Number(stock) || 0;

    const [result] = await db.query(
      "INSERT INTO books (title, author, stock) VALUES (?, ?, ?)",
      [title, author, numericStock]
    );

    return NextResponse.json(
      {
        message: "Buku berhasil ditambahkan",
        book: { id: result.insertId, title, author, stock: numericStock },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    console.error("BOOK ADD ERROR:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan buku." },
      { status: 500 }
    );
  }
}

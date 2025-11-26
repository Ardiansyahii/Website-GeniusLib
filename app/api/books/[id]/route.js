import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(request, { params }) {
  const bookId = params?.id;

  if (!bookId) {
    return NextResponse.json(
      { message: "ID buku wajib disertakan." },
      { status: 400 }
    );
  }

  try {
    const [rows] = await db.query("SELECT * FROM books WHERE id = ?", [bookId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Buku tidak ditemukan." },
        { status: 404 }
      );
    }

    const book = rows[0];
    const user = getAuthUser(request);
    const role = user?.role || "guest";

    const response = {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      stock: Number(book.stock ?? 0),
      cover_image: book.cover_image,
    };

    if (role === "petugas" || role === "admin") {
      response.isbn = book.isbn ?? null;
      response.location = book.shelf_location ?? null;
      response.total_stock = Number(book.total_stock ?? response.stock);
      response.updated_at = book.updated_at;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("BOOK DETAIL ERROR:", error);
    return NextResponse.json(
      { message: "Kesalahan server saat mengambil detail buku." },
      { status: 500 }
    );
  }
}
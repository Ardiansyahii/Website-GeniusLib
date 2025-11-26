import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT id, title, author, stock, cover_image FROM books ORDER BY title ASC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("BOOK LIST ERROR:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data buku." },
      { status: 500 }
    );
  }
}
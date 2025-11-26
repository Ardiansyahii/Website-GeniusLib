// Next.js API Route for Petugas - Book Collection (GET, POST)
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getAuthUser, ensureRole } from '@/lib/auth';

// Fungsi GET: Mengambil semua data buku
export async function GET() {
    try {
        const sql = "SELECT id, title, author, stock FROM books ORDER BY title ASC";
        const results = await query(sql);

        const books = results.map(book => ({
            ...book,
            stock: Number(book.stock)
        }));

        return NextResponse.json(books);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// Fungsi POST: Menambahkan buku baru
export async function POST(request) {
    const actor = getAuthUser(request);
    try {
        ensureRole(actor, ["admin", "petugas"]);

        const { title, author, stock } = await request.json();

        if (!title || !author || stock === undefined || stock < 0) {
             return NextResponse.json({ message: 'Data Judul, Penulis, atau Stok tidak valid.' }, { status: 400 });
        }

        const sql = `
            INSERT INTO books (title, author, stock) 
            VALUES (?, ?, ?)
        `;
        const params = [title, author, parseInt(stock, 10)];
        
        const result = await query(sql, params);
        
        const newBook = { id: result.insertId, title, author, stock: parseInt(stock, 10) };

        return NextResponse.json({ message: 'Buku berhasil ditambahkan', book: newBook }, { status: 201 });

    } catch (error) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
        return NextResponse.json({ message: error.message || 'Gagal menyimpan data buku ke database.' }, { status: 500 });
    }
}
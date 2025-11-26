// Next.js API Route for Petugas - Single Book Operations (PUT, DELETE)
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getAuthUser, ensureRole } from '@/lib/auth';

// Fungsi PUT: Memperbarui data buku
export async function PUT(request, { params }) {
    const bookId = params.id;
    const actor = getAuthUser(request);
    try {
        ensureRole(actor, ["admin", "petugas"]);

        const { title, author, stock } = await request.json();

        if (!title || !author || stock === undefined || stock < 0) {
             return NextResponse.json({ message: 'Data Judul, Penulis, atau Stok tidak valid.' }, { status: 400 });
        }

        const sql = `
            UPDATE books 
            SET title = ?, author = ?, stock = ? 
            WHERE id = ?
        `;
        const paramsQuery = [title, author, parseInt(stock, 10), bookId];

        const result = await query(sql, paramsQuery);

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Buku tidak ditemukan atau tidak ada perubahan' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Buku berhasil diperbarui' }, { status: 200 });

    } catch (error) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
        return NextResponse.json({ message: error.message || 'Gagal memperbarui data buku di database.' }, { status: 500 });
    }
}

// Fungsi DELETE: Menghapus buku
export async function DELETE(request, { params }) {
    const bookId = params.id;
    const actor = getAuthUser(request);
    try {
        ensureRole(actor, ["admin", "petugas"]);
        const sql = "DELETE FROM books WHERE id = ?";
        const result = await query(sql, [bookId]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Buku tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Buku berhasil dihapus' }, { status: 200 });

    } catch (error) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
        return NextResponse.json({ message: error.message || 'Gagal menghapus data buku dari database.' }, { status: 500 });
    }
}

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Method PUT untuk update profile
export async function PUT(req) {
    try {
        const body = await req.json();
        const { id, name, email, password, bio, class_name } = body;

        if (!id) {
            return NextResponse.json({ message: "User ID diperlukan" }, { status: 400 });
        }

        // Siapkan query dinamis agar user bisa update sebagian field saja
        let query = "UPDATE users SET name = ?, email = ?, bio = ?, class_name = ?";
        let params = [name, email, bio, class_name];

        // Jika password diisi, update password juga
        if (password && password.trim() !== "") {
            const hashed = await bcrypt.hash(password, 10);
            query += ", password = ?";
            params.push(hashed);
        }

        query += " WHERE id = ?";
        params.push(id);

        await db.query(query, params);

        // Ambil data terbaru untuk dikembalikan ke frontend (agar localStorage bisa diupdate)
        const [updatedRows] = await db.query("SELECT id, name, email, role, bio, class_name FROM users WHERE id = ?", [id]);
        
        return NextResponse.json({ 
            message: "Profil berhasil diperbarui", 
            user: updatedRows[0] 
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Gagal update profil", error: err.message }, { status: 500 });
    }
}
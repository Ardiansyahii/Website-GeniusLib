import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signAuthToken } from "@/lib/auth";

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Email dan password harus diisi." }, { status: 400 });
        }

        // 1. Cari user berdasarkan email
        // db.query dari mysql2/promise mengembalikan [rows, fields].
        // Destructuring [users] mengambil array 'rows'.
        const [users] = await db.query("SELECT id, name, email, password, role, status FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            // User tidak ditemukan (kembalikan pesan umum untuk keamanan)
            return NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            // Password salah (kembalikan pesan umum untuk keamanan)
            return NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
        }
        
        // 3. Cek Status Akun
        if (user.status !== 'active') {
            return NextResponse.json({ message: `Akun Anda berstatus: ${user.status}. Harap tunggu konfirmasi Admin/Petugas.` }, { status: 403 });
        }

        // 4. Login Berhasil
        // Data yang dikirim ke client (tanpa password)
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        };

        const token = signAuthToken(userData);

        const response = NextResponse.json({ 
            message: "Login berhasil",
            user: userData,
            token,
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 hari
        });

        return response;

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return NextResponse.json({ message: "Gagal memproses login. Silakan coba lagi." }, { status: 500 });
    }
}
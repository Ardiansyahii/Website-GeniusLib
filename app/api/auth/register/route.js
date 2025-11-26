import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Data tidak lengkap." }, { status: 400 });
    }
    
    // Cek apakah email sudah terdaftar
    const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "Email sudah terdaftar." }, { status: 400 });
    }

    // --- LOGIC TEST KHUSUS ADMIN (Untuk kemudahan pengujian) ---
    let finalRole = role;
    let finalStatus = 'pending';
    let hashedPassword = await bcrypt.hash(password, 10);
    
    const IS_TEST_ADMIN = (email === 'admin@geniuslib.com' && password === 'admin123');

    if (IS_TEST_ADMIN) {
        finalRole = 'admin';
        finalStatus = 'active';
        hashedPassword = await bcrypt.hash('admin123', 10); 
    } else if (role === 'admin' || role === 'petugas') {
        // Jika mendaftar sebagai admin/petugas lain, tetap pending
        finalStatus = 'pending'; 
    } else {
        // Siswa
        finalStatus = 'pending';
    }
    // --- AKHIR LOGIC TEST KHUSUS ADMIN ---

    // Simpan ke database
    const query = `
      INSERT INTO users (name, email, password, role, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await db.query(query, [name, email, hashedPassword, finalRole, finalStatus]);

    // Pesan respons berdasarkan status
    const message = finalStatus === 'active' 
        ? "Pendaftaran berhasil! Anda dapat langsung login." 
        : "Pendaftaran berhasil! Tunggu konfirmasi Admin.";


    return NextResponse.json({ 
        message: message,
        status: finalStatus
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err); // Log error spesifik
    return NextResponse.json({ message: "Gagal memproses pendaftaran. Silahkan coba lagi." }, { status: 500 });
  }
}
"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BookA, Clock, Search, User } from "lucide-react";

// --- BAGIAN 1: KOMPONEN LANDING PAGE (Untuk Guest/Login) ---

// Component Navbar untuk Guest
const GuestNavbar = () => (
    <nav className="fixed top-0 left-0 w-full z-10 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-md">
                    <BookA size={18} />
                </div>
                <span className="font-bold text-xl text-slate-800">Genius<span className="text-blue-600">Lib</span></span>
            </Link>
            
            {/* Navigation (Tampilan Desktop) */}
            <div className="hidden sm:flex items-center space-x-4">
                <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition">Fitur Utama</a>
                <a href="#about" className="text-slate-600 hover:text-blue-600 font-medium transition">Tentang Kami</a>
            </div>

            {/* Tombol Aksi */}
            <div className="space-x-3">
                <Link 
                    href="/register" 
                    className="hidden sm:inline-block px-4 py-2 text-blue-600 border border-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                >
                    Daftar
                </Link>
                <Link 
                    href="/login" 
                    className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-500/30"
                >
                    Masuk
                </Link>
            </div>
        </div>
    </nav>
);

// Component Utama Guest Landing (Diperbarui untuk Perpustakaan Fisik)
const GuestLanding = () => {
    return (
        <div className="min-h-screen pt-20 bg-gradient-to-br from-white to-blue-50 font-sans text-slate-800">
            <GuestNavbar />

            {/* Hero Section */}
            <section className="py-20 sm:py-32 max-w-7xl mx-auto px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 leading-tight tracking-tighter">
                        Kelola Peminjaman <span className="text-blue-600">Buku Fisik</span> Sekolah Anda
                    </h1>
                    <p className="text-xl sm:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                        GeniusLib adalah sistem perpustakaan modern yang memudahkan siswa dan guru melacak status peminjaman, jatuh tempo, dan riwayat buku fisik.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            href="/login" 
                            className="px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-1"
                        >
                            Mulai Sekarang
                        </Link>
                        <a 
                            href="#features" 
                            className="px-10 py-4 bg-white text-blue-600 font-bold text-lg border-2 border-blue-100 rounded-xl hover:border-blue-600 transition shadow-md"
                        >
                            Lihat Fitur
                        </a>
                    </div>
                </div>
                
                {/* Bagian Ilustrasi/Mockup Dihapus total - Halaman fokus pada teks inti */}

            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-12">Fitur Utama GeniusLib</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        
                        {/* Card 1 */}
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-lg transform transition hover:shadow-xl hover:-translate-y-1">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <Search size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Pencarian Cepat Katalog</h3>
                            <p className="text-slate-600">Temukan buku fisik berdasarkan judul, pengarang, atau ISBN yang tersedia di perpustakaan.</p>
                        </div>

                        {/* Card 2 */}
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-lg transform transition hover:shadow-xl hover:-translate-y-1">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <Clock size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Riwayat Transaksi</h3>
                            <p className="text-slate-600">Lacak status peminjaman, tanggal jatuh tempo, dan pengajuan pengembalian buku Anda secara *real-time*.</p>
                        </div>

                        {/* Card 3 */}
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-lg transform transition hover:shadow-xl hover:-translate-y-1">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                <User size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Profil Mandiri</h3>
                            <p className="text-slate-600">Kelola informasi profil, perbarui password, dan lihat ID unik Anda untuk verifikasi petugas perpustakaan.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section id="about" className="py-20 bg-blue-600 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4">Siap untuk Pengalaman Peminjaman Buku yang Lebih Baik?</h2>
                    <p className="text-blue-200 text-lg mb-8">
                        Daftarkan akun Anda dalam 30 detik dan mulai kelola transaksi perpustakaan!
                    </p>
                    <Link 
                        href="/register" 
                        className="px-8 py-3 bg-white text-blue-600 font-bold text-lg rounded-xl hover:bg-slate-100 transition shadow-xl"
                    >
                        Daftar Gratis Sekarang
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 bg-slate-800 text-white text-center">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-sm text-slate-400">© 2024 GeniusLib - Sistem Manajemen Perpustakaan Fisik.</p>
                    <p className="text-xs mt-1 text-slate-500">Ditenagai oleh Teknologi Terkini.</p>
                </div>
            </footer>
        </div>
    );
};

// --- BAGIAN 2: HALAMAN UTAMA ---
export default function HomePage() {
  return <GuestLanding />;
}
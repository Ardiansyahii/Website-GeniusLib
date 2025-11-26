"use client";
import Link from "next/link";
import { useState } from "react";
import { User, Mail, Lock, Library, AlertCircle, ArrowRight } from "lucide-react"; 

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Logika pemrograman TIDAK diubah sama sekali
  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.message || "Gagal registrasi");
    window.location.href = "/login";
  }

  // Kelas input yang diperbarui untuk visibilitas maksimal
  // PERHATIKAN: text-gray-900 dan appearance-none ditambahkan
  const inputClass = "block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-6 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 sm:text-base shadow-sm appearance-none";

  return (
    // Container utama
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      
      {/* Card Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
        
        {/* Header Section */}
        <div className="pt-8 pb-6 px-8 text-center bg-white">
          <div className="mx-auto bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-indigo-600">
            <Library size={32} strokeWidth={2} />
          </div>
          <h2 className="3xl font-extrabold text-gray-900 tracking-tight">
            Genius<span className="text-indigo-600">Lib</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Buat akun baru untuk mulai menjelajah koleksi buku.
          </p>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-8 pt-2">
          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* Input Nama dengan Icon */}
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-bold text-gray-900 ml-1">Nama Lengkap</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-600 transition-colors duration-200" />
                </div>
                <input 
                  id="name"
                  placeholder="Masukkan nama lengkap Anda" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Input Email dengan Icon */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 ml-1">Alamat Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-600 transition-colors duration-200" />
                </div>
                <input 
                  id="email"
                  placeholder="nama@sekolah.sch.id" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  type="email"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Input Password dengan Icon */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 ml-1">Kata Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-600 transition-colors duration-200" />
                </div>
                <input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className={inputClass}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">Minimal 6 karakter</p>
            </div>
            
            {/* Tampilan Error */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex items-start animate-pulse">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Terjadi kesalahan</h3>
                  <div className="mt-1 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            )}

            {/* Tombol Submit */}
            <button 
              type="submit"
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.01]"
            >
              Daftar Sekarang
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>
          
          {/* Divider Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Sudah memiliki akun?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                Masuk ke akun Anda
              </Link>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">&copy; 2024 GeniusLib School Library</p>
        </div>

      </div>
    </div>
  );
}
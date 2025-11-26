"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { BookOpen, LogIn, Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Kelas input yang diperbarui untuk visibilitas maksimal
  // text-gray-900 untuk memastikan warna hitam pekat saat mengetik
  const inputClass = "block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-6 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 sm:text-base shadow-sm appearance-none";


  useEffect(() => {
    // Logika pemrograman tidak diubah
    const user = localStorage.getItem("user");
    if (user) {
      const u = JSON.parse(user);
      if (u.role === "admin") {
        window.location.href = "/dashboard/admin";
      } else if (u.role === "petugas") {
        window.location.href = "/dashboard/petugas";
      } else {
        window.location.href = "/"; // Homepage Siswa
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    // Logika pemrograman tidak diubah
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user.status !== "active") {
          setError("Akun Anda belum diaktifkan oleh Admin.");
          return;
        }

        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Redirect sesuai role
        if (data.user.role === "admin") {
          window.location.href = "/dashboard/admin";
        } else if (data.user.role === "petugas") {
          window.location.href = "/dashboard/petugas";
        } else {
          window.location.href = "/dashboard/student";
        }
      } else {
        setError(data.message || "Email atau password salah.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
        
        {/* Header Section */}
        <div className="pt-8 pb-6 px-8 text-center bg-white">
          <div className="mx-auto bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-indigo-600 shadow-md">
            <BookOpen size={32} strokeWidth={2} />
          </div>
          <h2 className="3xl font-extrabold text-gray-900 tracking-tight">
            Selamat Datang Kembali
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Masuk untuk melanjutkan ke Genius<span className="text-indigo-600">Lib</span>
          </p>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-8 pt-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input Email dengan Icon */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* Ikon untuk input email */}
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-600 transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Masukkan alamat email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Input Password dengan Icon */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* Ikon untuk input password */}
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
                  disabled={loading}
                />
              </div>
            </div>

            {/* Tampilan Error */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Gagal Masuk</h3>
                  <div className="mt-1 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            )}

            {/* Tombol Submit */}
            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold transition-all duration-300 transform ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-indigo-300"
              }`}
              disabled={loading}
            >
              {loading ? (
                // Spinner SVG
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <LogIn size={20} /> Masuk
                </>
              )}
            </button>
          </form>

          {/* Link Daftar */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Daftar di sini
            </Link>
          </p>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">&copy; 2024 GeniusLib</p>
        </div>

      </div>
    </div>
  );
}
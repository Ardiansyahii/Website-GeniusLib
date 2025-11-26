"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Book,
  BookOpen,
  CheckCircle,
  Clock,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
} from "lucide-react";

const SidebarLink = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-3 rounded-xl transition duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
    }`}
  >
    <Icon size={20} className="mr-3 flex-shrink-0" />
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

const StudentDashboardView = ({
  user,
  books,
  myTransactions,
  refreshBooks,
  refreshHistory,
}) => {
  const [activeTab, setActiveTab] = useState("catalog");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    password: "",
    bio: user.bio || "",
    class_name: user.class_name || "",
  });

  const fetchBooksInternal = async () => {
    setLoading(true);
    try {
      await refreshBooks();
    } catch (error) {
      console.error("Gagal memuat buku:", error);
    } finally {
      setLoading(false);
    }
  };

  async function handleBorrow(bookId) {
    if (!confirm("Ajukan peminjaman untuk buku ini?")) return;

    try {
      const res = await fetch("/api/books/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Berhasil diajukan! Tunggu persetujuan petugas.");
        setActiveTab("mybooks");
        refreshHistory();
      } else {
        alert(data.message || "Gagal mengajukan peminjaman.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  }

  async function handleStudentAction(tId, action, bookId) {
    const msg =
      action === "pickup"
        ? "Pastikan Anda sudah di perpustakaan dan menerima fisik buku. Lanjutkan?"
        : "Apakah Anda ingin mengajukan pengembalian buku ini?";

    if (!confirm(msg)) return;

    try {
      const res = await fetch("/api/transactions/student-action", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: tId, action }),
      });

      if (res.ok) {
        refreshHistory();
      } else {
        const data = await res.json();
        alert("Gagal memproses aksi: " + (data.message || "Error tidak diketahui."));
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, ...profileForm }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Profil diperbarui!");
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.reload();
      } else {
        alert("Gagal update: " + (data.message || "Error tidak diketahui."));
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan saat update.");
    }
  }

  const renderStatusButton = (t) => {
    switch (t.status) {
      case "pending":
        return (
          <span className="text-orange-500 text-sm font-medium flex items-center gap-1">
            <Clock size={14} /> Menunggu Persetujuan
          </span>
        );
      case "approved":
        return (
          <div className="flex flex-col gap-1">
            <span className="text-green-600 text-xs font-bold">
              Disetujui! Ambil Buku.
            </span>
            <button
              onClick={() => handleStudentAction(t.id, "pickup", t.book_id)}
              className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 shadow-md"
            >
              Saya Sudah Ambil
            </button>
          </div>
        );
      case "borrowed":
        return (
          <div className="flex flex-col gap-1">
            <span className="text-purple-600 text-xs font-bold">
              Dipinjam (Due: {new Date(t.due_date).toLocaleDateString()})
            </span>
            <button
              onClick={() => handleStudentAction(t.id, "return_request", null)}
              className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-orange-600 shadow-md"
            >
              Ajukan Pengembalian
            </button>
          </div>
        );
      case "return_pending":
        return (
          <span className="text-yellow-600 text-sm font-medium flex items-center gap-1 animate-pulse">
            <Clock size={14} /> Konfirmasi Pengembalian
          </span>
        );
      case "returned":
        return (
          <span className="text-green-600 text-sm font-medium flex items-center gap-1">
            <CheckCircle size={14} /> Sudah Dikembalikan
          </span>
        );
      case "rejected":
        return (
          <span className="text-red-500 text-sm font-medium flex items-center gap-1">
            <AlertCircle size={14} /> Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  const userNameInitial = user.name ? user.name.charAt(0) : "U";
  const firstName = user.name ? user.name.split(" ")[0] : "Pengguna";
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:h-screen lg:flex lg:flex-col p-5 border-r border-slate-100`}
      >
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <BookOpen size={20} />
            </div>
            <span className="font-bold text-xl">
              Genius<span className="text-blue-600">Lib</span>
            </span>
          </div>
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center p-3 mb-6 bg-blue-50/70 rounded-xl border border-blue-100">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 shadow-md">
            {userNameInitial}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 leading-none">
              {firstName}
            </p>
            <p className="text-xs text-blue-600 font-medium">
              {user.role.toUpperCase()}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink
            icon={Book}
            label="Katalog Buku"
            isActive={activeTab === "catalog"}
            onClick={() => {
              setActiveTab("catalog");
              fetchBooksInternal();
              closeSidebar();
            }}
          />
          <SidebarLink
            icon={Clock}
            label="Pinjaman Saya"
            isActive={activeTab === "mybooks"}
            onClick={() => {
              setActiveTab("mybooks");
              refreshHistory();
              closeSidebar();
            }}
          />
          <SidebarLink
            icon={Settings}
            label="Pengaturan Profil"
            isActive={false}
            onClick={() => {
              setIsProfileOpen(true);
              closeSidebar();
            }}
          />
        </nav>

        <div className="pt-4 border-t border-slate-100 mt-4">
          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" });
              } catch (error) {
                console.error("Gagal logout:", error);
              } finally {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                window.location.href = "/login";
              }
            }}
            className="flex items-center w-full p-3 rounded-xl text-red-500 hover:bg-red-50 transition duration-200"
          >
            <LogOut size={20} className="mr-3 flex-shrink-0" />
            <span className="font-semibold text-sm">Keluar Akun</span>
          </button>
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-8">
        <header className="lg:hidden mb-6 flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded text-white">
              <BookOpen size={20} />
            </div>
            <span className="font-bold text-lg">
              Genius<span className="text-blue-600">Lib</span>
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-slate-600 p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-1">
            {activeTab === "catalog" ? "Katalog Buku Fisik" : "Riwayat Peminjaman"}
          </h1>
          <p className="text-slate-500 text-base">
            {activeTab === "catalog"
              ? "Temukan dan ajukan pinjaman untuk buku yang tersedia di perpustakaan."
              : "Lacak status peminjaman dan pengembalian buku Anda."}
          </p>
        </div>

        {activeTab === "catalog" && (
          <div className="mb-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="Cari judul buku, pengarang, atau ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === "catalog" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {loading ? (
              <p className="col-span-full text-center py-10 text-slate-500">
                Memuat data buku...
              </p>
            ) : (
              books
                .filter(
                  (b) =>
                    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    b.author.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition overflow-hidden flex flex-col transform hover:-translate-y-0.5"
                  >
                    <div className="relative h-44 bg-blue-50 flex items-center justify-center text-blue-400 overflow-hidden">
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold">
                        Stok: {book.stock}
                      </div>
                      {book.cover_image ? (
                        <Image
                          src={book.cover_image}
                          alt={book.title}
                          fill
                          sizes="(min-width: 1024px) 200px, 40vw"
                          className="object-cover"
                        />
                      ) : (
                        <BookOpen size={48} />
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 text-base line-clamp-2 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 italic">
                        {book.author}
                      </p>

                      <button
                        onClick={() => handleBorrow(book.id)}
                        disabled={book.stock <= 0 || user.status !== "active"}
                        className={`mt-auto w-full py-2 rounded-lg text-sm font-bold transition shadow-md ${
                          book.stock > 0 && user.status === "active"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {user.status !== "active"
                          ? "Akun Pending"
                          : book.stock > 0
                          ? "Ajukan Pinjam"
                          : "Stok Habis"}
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === "mybooks" && (
          <div className="space-y-4">
            {loading ? (
              <p className="col-span-full text-center py-10 text-slate-500">
                Memuat riwayat transaksi...
              </p>
            ) : myTransactions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
                <Clock size={32} className="text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  Anda belum memiliki riwayat peminjaman.
                </p>
              </div>
            ) : (
              myTransactions.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex items-center gap-6"
                >
                  <div className="w-12 h-16 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 text-blue-600">
                    <Book size={24} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">
                      {t.book_title}
                    </h3>
                    <p className="text-xs text-slate-500 italic mb-2">
                      {t.author}
                    </p>
                    <p className="text-xs text-slate-400">
                      Diajukan: {new Date(t.request_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="w-56 text-right">{renderStatusButton(t)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-transform duration-300">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Settings size={18} /> Edit Profil
              </h3>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="hover:text-blue-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="bg-slate-100 p-3 rounded-lg text-xs text-slate-700 flex justify-between items-center">
                <span className="font-bold">ID Pengguna Anda:</span>
                <code className="text-blue-700 font-mono break-all">{user.id}</code>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                  Nama Lengkap
                </label>
                <input
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    Kelas
                  </label>
                  <input
                    value={profileForm.class_name}
                    placeholder="XII RPL 1"
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, class_name: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    Email (Tidak Dapat Diubah)
                  </label>
                  <input
                    value={profileForm.email}
                    disabled
                    className="w-full border border-slate-200 bg-slate-50 text-slate-400 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                  Bio Singkat
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bio: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                  Password Baru (Opsional)
                </label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tidak ingin ganti"
                  value={profileForm.password}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, password: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2 shadow-lg"
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function StudentDashboardPage() {
  const [user] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch("/api/books/list");
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal memuat buku:", error);
      setBooks([]);
    }
  }, []);

  const fetchHistory = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const res = await fetch("/api/transactions/my-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal memuat riwayat transaksi:", error);
      setTransactions([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (user.role !== "siswa") {
      if (user.role === "admin") {
        window.location.href = "/dashboard/admin";
      } else if (user.role === "petugas") {
        window.location.href = "/dashboard/petugas";
      } else {
        window.location.href = "/login";
      }
      return;
    }

    let cancelled = false;
    const loadData = async () => {
      await fetchBooks();
      if (!cancelled) {
        await fetchHistory(user.id);
      }
    };
    loadData();

    return () => {
      cancelled = true;
    };
  }, [user, fetchBooks, fetchHistory]);

  if (!user || user.role !== "siswa") {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">
        Memuat dashboard siswa...
      </div>
    );
  }

  return (
    <StudentDashboardView
      user={user}
      books={books}
      myTransactions={transactions}
      refreshBooks={fetchBooks}
      refreshHistory={() => fetchHistory(user.id)}
    />
  );
}


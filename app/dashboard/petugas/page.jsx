"use client";
import React, { useEffect, useState } from "react";
import { 
    BookOpen, 
    CheckCircle, 
    Clock, 
    XCircle, 
    RefreshCcw, 
    LogOut,
    Search,
    AlertCircle,
    Package
} from "lucide-react";

// Catatan: Di lingkungan produksi, ganti window.confirm dan alert dengan modal kustom.

export default function PetugasDashboard() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("requests"); // requests | returns | active | history
    const [searchTerm, setSearchTerm] = useState("");

    // 1. Cek Auth & Load Data
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            window.location.href = "/login";
            return;
        }
        const userObj = JSON.parse(storedUser);
        if (userObj.role !== "petugas") {
            // Menggunakan div custom notification atau console.error, hindari alert() di production
            console.error("Akses ditolak! Halaman ini khusus Petugas.");
            window.location.href = "/";
            return;
        }
        fetchTransactions();
    }, []);

    async function fetchTransactions() {
        setLoading(true);
        try {
            const res = await fetch("/api/transactions/all");
            const data = await res.json();
            setTransactions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Gagal load transaksi", err);
        } finally {
            setLoading(false);
        }
    }

    // 2. Logic Update Status
    async function handleStatusUpdate(tId, newStatus, bookId) {
        // PERINGATAN: Ganti window.confirm dengan MODAL KUSTOM.
        const confirmMsg = 
            newStatus === 'approved' ? "Setujui peminjaman ini? Stok buku akan berkurang." :
            newStatus === 'rejected' ? "Tolak peminjaman ini?" :
            newStatus === 'returned' ? "Konfirmasi buku sudah diterima kembali? Stok akan bertambah." :
            "Update status?";
            
        if (!window.confirm(confirmMsg)) return;

        try {
            // bookId diperlukan saat 'approved' (kurangi stok) dan 'returned' (tambah stok)
            const res = await fetch("/api/transactions/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactionId: tId, status: newStatus, bookId: bookId }),
            });

            if (res.ok) {
                fetchTransactions(); // Refresh data
                // PERINGATAN: Ganti alert() dengan NOTIFIKASI KUSTOM.
                alert("Status berhasil diperbarui!"); 
            } else {
                // PERINGATAN: Ganti alert() dengan NOTIFIKASI KUSTOM.
                alert("Gagal update status");
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Gagal logout:", error);
        } finally {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    };

    // --- FILTERING DATA SESUAI TAB ---
    const filteredData = transactions.filter(t => {
        // Search Filter
        const term = searchTerm.toLowerCase();
        const matchSearch = 
            t.user_name?.toLowerCase().includes(term) || // Tambahkan optional chaining untuk keamanan
            t.book_title?.toLowerCase().includes(term);

        if (!matchSearch) return false;

        // Tab Filter
        if (activeTab === "requests") return t.status === "pending"; 
        if (activeTab === "returns") return t.status === "return_pending";
        if (activeTab === "active") return t.status === "borrowed" || t.status === "approved";
        if (activeTab === "history") return t.status === "returned" || t.status === "rejected";
        
        return false;
    });

    // Badge Status Helper
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Menunggu Persetujuan</span>;
            case 'approved': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Siap Diambil Siswa</span>;
            case 'borrowed': return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">Sedang Dipinjam</span>;
            case 'return_pending': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold animate-pulse">Menunggu Konfirmasi Kembali</span>;
            case 'returned': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Selesai</span>;
            case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Ditolak</span>;
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* NAVBAR */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-2 rounded text-white"><BookOpen size={20}/></div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Petugas<span className="text-indigo-600">Area</span></h1>
                        <p className="text-xs text-slate-500">Sirkulasi & Manajemen</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center bg-slate-100 px-3 py-2 rounded-lg">
                        <Search size={18} className="text-slate-400 mr-2"/>
                        <input 
                            className="bg-transparent border-none focus:outline-none text-sm w-64"
                            placeholder="Cari Siswa atau Judul Buku..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"><LogOut size={20}/></button>
                </div>
            </nav>

            {/* CONTENT */}
            <main className="max-w-7xl mx-auto p-6">
                
                {/* --- TOMBOL KELOLA BUKU BARU --- */}
                <a 
                    href="/dashboard/petugas/books" 
                    className="flex items-center justify-center w-full md:w-auto gap-3 px-6 py-3 mb-8 rounded-xl font-semibold transition-all shadow-md bg-indigo-600 text-white hover:bg-indigo-700 ring-2 ring-indigo-300"
                >
                    <Package size={20} /> Kelola Buku (Manajemen Inventaris)
                </a>
                {/* ------------------------------- */}

                {/* TAB NAVIGATION */}
                <div className="flex flex-wrap gap-4 mb-8 border-b pb-4 border-slate-200">
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all shadow-sm ${activeTab === 'requests' ? 'bg-orange-500 text-white ring-2 ring-orange-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                        <Clock size={18} /> Permintaan Baru
                        {transactions.filter(t => t.status === 'pending').length > 0 && (
                            <span className="bg-white text-orange-600 text-xs px-2 py-0.5 rounded-full ml-1 font-bold">
                                {transactions.filter(t => t.status === 'pending').length}
                            </span>
                        )}
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('returns')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all shadow-sm ${activeTab === 'returns' ? 'bg-yellow-500 text-white ring-2 ring-yellow-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                        <RefreshCcw size={18} /> Konfirmasi Kembali
                        {transactions.filter(t => t.status === 'return_pending').length > 0 && (
                            <span className="bg-white text-yellow-600 text-xs px-2 py-0.5 rounded-full ml-1 font-bold">
                                {transactions.filter(t => t.status === 'return_pending').length}
                            </span>
                        )}
                    </button>

                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all shadow-sm ${activeTab === 'active' ? 'bg-purple-600 text-white ring-2 ring-purple-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                        <BookOpen size={18} /> Sedang Dipinjam
                    </button>

                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all shadow-sm ${activeTab === 'history' ? 'bg-slate-600 text-white ring-2 ring-slate-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                    >
                        <CheckCircle size={18} /> Riwayat
                    </button>
                </div>

                {/* DATA TABLE / CARDS */}
                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Mengambil data sirkulasi...</div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-400 font-medium">Tidak ada transaksi di kategori ini.</p>
                        </div>
                    ) : (
                        filteredData.map((t) => (
                            <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                
                                {/* Info Utama */}
                                <div className="flex gap-4 mb-4 md:mb-0">
                                    <div className="w-12 h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                                        {/* Placeholder Cover Buku */}
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Cover</div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{t.book_title}</h3>
                                        <div className="text-sm text-slate-500 mb-1">
                                            Peminjam: <span className="font-semibold text-slate-700">{t.user_name}</span> ({t.class_name || "Siswa"})
                                        </div>
                                        <div className="text-xs text-slate-400 flex gap-2 mt-2">
                                            <span>Req: {new Date(t.request_date).toLocaleDateString()}</span>
                                            {t.due_date && <span>• Due: {new Date(t.due_date).toLocaleDateString()}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Action */}
                                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                    <div>{getStatusBadge(t.status)}</div>
                                    
                                    {/* ACTION BUTTONS BERDASARKAN TAB */}
                                    <div className="flex gap-2">
                                        
                                        {/* CASE 1: PERMINTAAN BARU -> Approve / Reject */}
                                        {activeTab === 'requests' && t.status === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleStatusUpdate(t.id, 'approved', t.book_id)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                                >
                                                    Setujui
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusUpdate(t.id, 'rejected', t.book_id)}
                                                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                                                >
                                                    Tolak
                                                </button>
                                            </>
                                        )}

                                        {/* CASE 2: KONFIRMASI PENGEMBALIAN -> Confirm Return */}
                                        {activeTab === 'returns' && t.status === 'return_pending' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(t.id, 'returned', t.book_id)} // book_id dikirim agar stok bisa ditambah di API
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                            >
                                                <CheckCircle size={16}/> Terima Buku (Selesai)
                                            </button>
                                        )}

                                        {/* CASE 3: ACTIVE (SIAP DIAMBIL / BORROWED) -> Manual Action (Opsional) */}
                                        {activeTab === 'active' && t.status === 'approved' && (
                                            <div className="text-xs text-slate-500 italic">Menunggu siswa klik &quot;Ambil Buku&quot;</div>
                                        )}
                                        {activeTab === 'active' && t.status === 'borrowed' && (
                                            <div className="text-xs text-slate-500 italic">Menunggu siswa klik &quot;Kembalikan&quot;</div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
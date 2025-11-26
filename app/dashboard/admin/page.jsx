"use client";
import React, { useEffect, useState } from "react";
import { 
  Users, 
  Check, 
  X, 
  LogOut, 
  Search, 
  ShieldAlert, 
  ShieldCheck,
  LayoutDashboard,
  Menu,
  ChevronRight,
  Bell,
  Settings,
  Filter
} from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'active' | 'all'
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // UI State tambahan untuk mobile menu

  // 1. Cek Auth & Load Data (LOGIKA TIDAK DIUBAH)
  useEffect(() => {
    // Proteksi sederhana client-side
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }
    const userObj = JSON.parse(storedUser);
    if (userObj.role !== "admin") {
      alert("Akses ditolak! Anda bukan Admin.");
      window.location.href = "/";
      return;
    }

    fetchUsers();
  }, []);

  // 2. Fungsi Fetch Users (LOGIKA TIDAK DIUBAH)
  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users/list");
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Gagal load users", err);
    } finally {
      setLoading(false);
    }
  }

  // 3. Fungsi Approve/Reject (LOGIKA TIDAK DIUBAH)
  async function handleApproval(userId, action) {
    const confirmMsg = action === 'approve' ? "Terima user ini?" : "Tolak user ini?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch("/api/admin/users/approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });

      if (res.ok) {
        // Refresh data tanpa reload page
        fetchUsers();
        alert(`User berhasil di-${action}`);
      } else {
        alert("Gagal memproses data");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 4. Logout Logic (LOGIKA TIDAK DIUBAH)
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

  // --- FILTERING LOGIC (LOGIKA TIDAK DIUBAH) ---
  const filteredUsers = users.filter((u) => {
    // Filter by Tab
    if (activeTab === "pending" && u.status !== "pending") return false;
    if (activeTab === "active" && u.status !== "active") return false;
    if (activeTab === "rejected" && u.status !== "rejected") return false;

    // Filter by Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const pendingCount = users.filter(u => u.status === 'pending').length;

  return (
    <div className="flex h-screen bg-white font-sans text-slate-800 overflow-hidden">
      
      {/* MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-blue-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR: Professional Blue (Blue-600) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-blue-600 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 bg-blue-700 border-b border-blue-500/30">
          <div className="flex items-center gap-2 font-bold text-xl tracking-wide">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-700 shadow-sm">
              G
            </div>
            <span>GeniusLib</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-bold text-blue-200 uppercase tracking-widest opacity-80">
            Menu Utama
          </div>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-white text-blue-700 rounded-lg shadow-sm transition-all font-medium group">
            <Users size={18} className="text-blue-600" />
            <span>Manajemen User</span>
            {pendingCount > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-blue-100 hover:bg-blue-500/50 hover:text-white rounded-lg transition-all font-medium group">
            <LayoutDashboard size={18} className="text-blue-200 group-hover:text-white" />
            <span>Laporan</span>
            <span className="ml-auto text-[10px] bg-blue-800/40 px-2 py-0.5 rounded border border-blue-400/30 text-blue-200">Soon</span>
          </button>
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 bg-blue-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold border border-white/20">
               AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">Administrator</p>
              <p className="text-xs text-blue-200 truncate">admin@geniuslib.com</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-white/90 bg-white/10 hover:bg-white/20 rounded-md transition-all text-sm font-medium border border-white/10"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        
        {/* Header: Clean White */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Manajemen Pengguna
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Cari user..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-40 md:w-64 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all placeholder:text-slate-400 text-slate-700"
              />
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            
            <button className="text-slate-400 hover:text-blue-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Stats Cards: Blue & White Theme */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Menunggu Persetujuan</p>
                  <h3 className="text-2xl font-bold text-blue-700">{pendingCount}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ShieldAlert size={24} />
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                   <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">User Aktif</p>
                   <h3 className="text-2xl font-bold text-slate-800">{users.filter(u => u.status === 'active').length}</h3>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                  <ShieldCheck size={24} />
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                   <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Terdaftar</p>
                   <h3 className="text-2xl font-bold text-slate-800">{users.length}</h3>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                  <Users size={24} />
                </div>
              </div>
            </div>

            {/* Main Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
              
              {/* Clean Tabs */}
              <div className="flex border-b border-slate-100 px-6 pt-2">
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === 'pending' 
                    ? 'border-blue-600 text-blue-700' 
                    : 'border-transparent text-slate-500 hover:text-blue-600 hover:border-blue-200'
                  }`}
                >
                  Menunggu
                  {pendingCount > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {pendingCount}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('active')}
                  className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'active' 
                    ? 'border-blue-600 text-blue-700' 
                    : 'border-transparent text-slate-500 hover:text-blue-600 hover:border-blue-200'
                  }`}
                >
                  Aktif
                </button>
                <button 
                  onClick={() => setActiveTab('rejected')}
                  className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'rejected' 
                    ? 'border-blue-600 text-blue-700' 
                    : 'border-transparent text-slate-500 hover:text-blue-600 hover:border-blue-200'
                  }`}
                >
                  Ditolak
                </button>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Bio/Kelas</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                          <div className="inline-block h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <p className="text-sm">Memuat data...</p>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-3">
                            <Search size={28} />
                          </div>
                          <p className="text-slate-900 font-medium">Data tidak ditemukan</p>
                          <p className="text-slate-500 text-sm">Tidak ada user dengan status atau kata kunci ini.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 text-sm">{user.name}</div>
                                <div className="text-xs text-slate-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {user.class_name || user.bio || <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-6 py-4">
                            {/* Semantic Colors for Badges (Harus tetap beda warna agar user paham) */}
                            {user.status === 'pending' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                Menunggu
                              </span>
                            )}
                            {user.status === 'active' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Aktif
                              </span>
                            )}
                            {user.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Ditolak
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {user.status === 'pending' ? (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleApproval(user.id, 'approve')}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md shadow-sm transition-all active:scale-95"
                                  title="Terima User"
                                >
                                  <Check size={14} /> Terima
                                </button>
                                <button 
                                  onClick={() => handleApproval(user.id, 'reject')}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 text-xs font-bold rounded-md transition-all active:scale-95"
                                  title="Tolak User"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button className="text-slate-300 hover:text-blue-600 transition-colors">
                                <ChevronRight size={18} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
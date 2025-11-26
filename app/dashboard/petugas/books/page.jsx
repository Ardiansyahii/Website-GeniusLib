"use client";
import React, { useEffect, useState, useMemo } from "react";
import { 
    AlertCircle,
    BookOpen, 
    CheckCircle,
    Edit, 
    LayoutDashboard,
    LogOut,
    Plus, 
    RefreshCcw,
    Save,
    Search, 
    Trash2, 
    X
} from "lucide-react";

// Komponen Modal Kustom Sederhana (reused)
const CustomMessage = ({ message, type, onClose }) => {
    if (!message) return null;
    
    const baseClasses = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40";
    let icon, colorClasses;

    switch (type) {
        case 'error':
            icon = <X size={24} />;
            colorClasses = "bg-red-500 text-white";
            break;
        case 'success':
            icon = <CheckCircle size={24} />;
            colorClasses = "bg-green-500 text-white";
            break;
        case 'confirm':
        default:
            icon = <AlertCircle size={24} />;
            colorClasses = "bg-yellow-500 text-white";
            break;
    }

    return (
        <div className={baseClasses} onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300 scale-100" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-2 rounded-full ${colorClasses}`}>{icon}</div>
                    <h3 className="text-lg font-semibold text-slate-800">Pemberitahuan</h3>
                </div>
                <p className="text-slate-600 mb-6">{message}</p>
                <div className="flex justify-end">
                    <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

// Komponen Modal Tambah/Edit Buku
const BookFormModal = ({ isOpen, onClose, form, isEdit, onChange, onSave }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 transform transition-all duration-300 scale-100" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h3 className="text-xl font-bold text-slate-800">{isEdit ? "Edit Buku" : "Tambah Buku Baru"}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Judul Buku</label>
                        <input 
                            type="text" 
                            name="title" 
                            value={form.title} 
                            onChange={onChange} 
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Penulis</label>
                        <input 
                            type="text" 
                            name="author" 
                            value={form.author} 
                            onChange={onChange} 
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Stok Tersedia</label>
                        <input 
                            type="number" 
                            name="stock" 
                            value={form.stock} 
                            onChange={onChange} 
                            required
                            min="0"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit"
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                            <Save size={16}/> {isEdit ? "Simpan Perubahan" : "Tambah Buku"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default function PetugasBooksPage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBook, setCurrentBook] = useState(null); // Data buku yang akan diedit
    const [modalForm, setModalForm] = useState({ title: '', author: '', stock: 0 });

    useEffect(() => {
        // Cek Auth (Logika yang sama seperti dashboard)
        const storedUser = localStorage.getItem("user");
        if (!storedUser || JSON.parse(storedUser).role !== "petugas") {
            window.location.href = "/login";
            return;
        }
        fetchBooks();
    }, []);

    async function fetchBooks() {
        setLoading(true);
        try {
            const res = await fetch("/api/petugas/books");
            if (!res.ok) throw new Error("Gagal mengambil data buku");
            const data = await res.json();
            setBooks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Gagal load buku", err);
            setMessage({ text: "Gagal memuat data buku.", type: 'error' });
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }

    const handleOpenModal = (book = null) => {
        setCurrentBook(book);
        setModalForm(book ? { ...book, stock: Number(book.stock ?? 0) } : { title: '', author: '', stock: 0 });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentBook(null);
        setModalForm({ title: '', author: '', stock: 0 });
    };

    const handleModalChange = (e) => {
        const { name, value, type } = e.target;
        setModalForm(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value
        }));
    };

    const handleSaveBook = async () => {
        const payload = {
            ...modalForm,
            stock: Number(modalForm.stock || 0),
        };

        const isEdit = !!currentBook?.id;
        if (isEdit) {
            payload.id = currentBook.id;
        }

        const method = isEdit ? "PUT" : "POST";
        const url = isEdit ? `/api/petugas/books/${currentBook.id}` : "/api/petugas/books";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setMessage({ text: `Buku berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}!`, type: 'success' });
                handleCloseModal();
                fetchBooks(); 
            } else {
                const errorData = await res.json();
                setMessage({ text: `Gagal menyimpan buku: ${errorData.message || 'Kesalahan Server'}`, type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: "Terjadi kesalahan saat menyimpan data.", type: 'error' });
        }
    };

    const handleDeleteBook = async (bookId, title) => {
        if (!window.confirm(`Yakin ingin menghapus buku "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;

        try {
            const res = await fetch(`/api/petugas/books/${bookId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setMessage({ text: "Buku berhasil dihapus!", type: 'success' });
                fetchBooks();
            } else {
                const errorData = await res.json();
                setMessage({ text: `Gagal menghapus buku: ${errorData.message || 'Kesalahan Server'}`, type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: "Terjadi kesalahan saat menghapus data.", type: 'error' });
        }
    };

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

    const filteredBooks = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return books.filter(b => 
            b.title.toLowerCase().includes(term) ||
            b.author.toLowerCase().includes(term)
        ).sort((a, b) => a.title.localeCompare(b.title));
    }, [books, searchTerm]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Custom Modal/Alerts */}
            <CustomMessage 
                message={message?.text} 
                type={message?.type} 
                onClose={() => setMessage(null)} 
            />
            
            <BookFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                form={modalForm}
                isEdit={!!currentBook}
                onChange={handleModalChange}
                onSave={handleSaveBook}
            />

            {/* NAVBAR */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-green-600 p-2 rounded text-white"><BookOpen size={20}/></div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Manajemen<span className="text-green-600">Buku</span></h1>
                        <p className="text-xs text-slate-500">Tambah, Edit, Hapus Koleksi</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"><LogOut size={20}/></button>
                </div>
            </nav>

            {/* CONTENT */}
            <main className="max-w-7xl mx-auto p-6">
                
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => window.location.href = "/dashboard/petugas"}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shadow-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm"
                        >
                            <LayoutDashboard size={18} /> Ke Dashboard Sirkulasi
                        </button>
                    </div>

                    <div className="flex items-center w-full md:w-auto gap-3">
                        <div className="flex items-center bg-white border border-slate-200 px-3 py-2 rounded-lg w-full md:w-80">
                            <Search size={18} className="text-slate-400 mr-2"/>
                            <input 
                                className="bg-transparent border-none focus:outline-none text-sm w-full"
                                placeholder="Cari Judul atau Penulis..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={fetchBooks} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition" disabled={loading}>
                            <RefreshCcw size={20} className={loading ? "animate-spin" : ""}/>
                        </button>
                        <button 
                            onClick={() => handleOpenModal()} 
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-md bg-green-600 text-white hover:bg-green-700 whitespace-nowrap"
                        >
                            <Plus size={18} /> Tambah Buku
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Penulis</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Stok</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-slate-500">Memuat data buku...</td>
                                </tr>
                            ) : filteredBooks.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-slate-400">Tidak ada buku yang ditemukan.</td>
                                </tr>
                            ) : (
                                filteredBooks.map((book) => (
                                    <tr key={book.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{book.title}</div>
                                            <div className="text-xs text-slate-500 sm:hidden">oleh {book.author}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                            <div className="text-sm text-slate-600">{book.author}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${book.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {book.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(book)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteBook(book.id, book.title)}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </main>
        </div>
    );
}
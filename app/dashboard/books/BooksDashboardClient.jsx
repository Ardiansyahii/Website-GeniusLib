"use client";
import { useCallback, useState } from "react";

export default function BooksDashboardClient({ initialBooks = [] }) {
  const [books, setBooks] = useState(initialBooks);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");

  const refreshBooks = useCallback(async () => {
    try {
      const res = await fetch("/api/books/list", { cache: "no-store" });
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat buku:", err);
      setBooks([]);
    }
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/books/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Gagal menambahkan buku");
      return;
    }
    setTitle("");
    setAuthor("");
    refreshBooks();
  }

  return (
    <div>
      <h2>Daftar Buku</h2>
      <form onSubmit={handleAdd}>
        <input
          placeholder="Judul"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <button type="submit">Tambah Buku</button>
      </form>
      <p style={{ color: "red" }}>{error}</p>

      <ul>
        {books.map((b) => (
          <li key={b.id}>
            {b.title} — {b.author}
          </li>
        ))}
      </ul>
    </div>
  );
}


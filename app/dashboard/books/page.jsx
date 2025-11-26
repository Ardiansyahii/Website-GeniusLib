import { db } from "@/lib/db";
import BooksDashboardClient from "./BooksDashboardClient";

export default async function BooksDashboard() {
  let books = [];
  try {
    const [rows] = await db.query(
      "SELECT id, title, author FROM books ORDER BY title ASC"
    );
    books = rows;
  } catch (error) {
    console.error("BOOK DASHBOARD LOAD ERROR:", error);
  }

  return <BooksDashboardClient initialBooks={books} />;
}

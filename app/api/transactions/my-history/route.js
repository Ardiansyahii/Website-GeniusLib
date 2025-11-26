import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuthUser, ensureRole } from "@/lib/auth";

export async function POST(req) {
    const actor = getAuthUser(req);
    try {
        ensureRole(actor, ["siswa", "admin", "petugas"]);

        const userId = actor.role === "siswa" ? actor.id : (await req.json()).userId;
        if (!userId) {
            return NextResponse.json({ message: "User ID diperlukan" }, { status: 400 });
        }

        const query = `
            SELECT t.*, b.title as book_title, b.author, b.cover_image 
            FROM transactions t
            JOIN books b ON t.book_id = b.id
            WHERE t.user_id = ?
            ORDER BY t.request_date DESC
        `;
        
        const [rows] = await db.query(query, [userId]);
        return NextResponse.json(rows);
    } catch (err) {
        if (err.message === "UNAUTHORIZED") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        if (err.message === "FORBIDDEN") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
        console.error(err);
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}

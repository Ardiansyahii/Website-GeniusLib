import { db } from "@/lib/db";

export async function logTransactionAction({
  transactionId,
  actorId,
  actorRole,
  action,
  notes = "",
}) {
  try {
    await db.query(
      `INSERT INTO transaction_logs (transaction_id, actor_id, actor_role, action, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [transactionId, actorId, actorRole, action, notes]
    );
  } catch (error) {
    console.error("AUDIT LOG ERROR:", error);
  }
}


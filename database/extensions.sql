-- Tambahan kebutuhan tahap 1: Audit log + Stored Procedure

-- 1. Tabel Audit Log Transaksi
CREATE TABLE IF NOT EXISTS transaction_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  actor_id INT NOT NULL,
  actor_role ENUM('admin','petugas','siswa') NOT NULL,
  action VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Stored Procedure untuk workflow persetujuan
DELIMITER //
CREATE PROCEDURE approve_transaction(IN p_transaction_id INT)
BEGIN
  DECLARE v_book_id INT;
  DECLARE v_status ENUM('pending','approved','borrowed','return_pending','returned','rejected');

  SELECT book_id, status
  INTO v_book_id, v_status
  FROM transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF v_status = 'pending' THEN
    UPDATE transactions
    SET status = 'approved',
        request_date = IFNULL(request_date, NOW())
    WHERE id = p_transaction_id;

    UPDATE books
    SET stock = GREATEST(stock - 1, 0)
    WHERE id = v_book_id;
  END IF;
END //
DELIMITER ;

-- Contoh penggunaan:
-- CALL approve_transaction(1);


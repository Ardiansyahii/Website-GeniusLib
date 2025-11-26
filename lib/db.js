import mysql from "mysql2/promise";

const {
  DB_HOST = "localhost",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "perpustakaan",
  DB_PORT = "3306",
  DB_CONNECTION_LIMIT = "10",
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: Number(DB_PORT),
  waitForConnections: true,
  connectionLimit: Number(DB_CONNECTION_LIMIT),
  queueLimit: 0,
});

export const db = pool;

export const query = (sql, params = []) => pool.query(sql, params);
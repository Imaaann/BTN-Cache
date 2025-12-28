import Database from "better-sqlite3";
import { PRAGMAS, SQLiteMode } from "./pragmas";

let db: Database.Database;

export function initSqlite(opts?: { filename?: string; mode?: SQLiteMode }) {
  if (db) return db;

  db = new Database(opts?.filename ?? "messages.db");
  const mode = opts?.mode ?? "safe";
  for (const pragma of PRAGMAS[mode]) {
    db.exec(pragma);
  }

  db.exec(`--sql
        CREATE TABLE IF NOT EXISTS messages (
            message_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        )`);
}

export function getDB() {
  if (!db) {
    throw new Error("Sqlite Not initialized");
  }
  return db;
}

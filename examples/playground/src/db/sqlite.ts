import Database from "better-sqlite3";
import { PRAGMAS, SQLiteMode } from "./pragmas";
import fs from "fs";
import path from "path";

const DB_PATH = path.resolve("data/messages.db");
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

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
            message_id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_messages_timestamp
        ON messages(timestamp);
        `);
}

export function getDB() {
  if (!db) {
    throw new Error("Sqlite Not initialized");
  }
  return db;
}

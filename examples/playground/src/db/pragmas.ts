export type SQLiteMode = "safe" | "unsafe";
export const PRAGMAS = {
  safe: [
    "PRAGMA journal_mode = WAL",
    "PRAGMA synchronous = FULL",
    "PRAGMA temp_store = DEFAULT",
  ],
  unsafe: [
    "PRAGMA journal_mode = WAL",
    "PRAGMA synchronous = OFF",
    "PRAGMA temp_store = MEMORY",
    "PRAGMA locking_mode = EXCLUSIVE",
  ],
} as const;

import { getDB, initSqlite } from "./sqlite";

initSqlite({
  filename: "data/messages.db",
  mode: "unsafe",
});

export interface MessageRow {
  message_id: string;
  username: string;
  message: string;
  timestamp: number;
}

const insertStatement = getDB().prepare(
  "INSERT INTO messages (message_id, username, message, timestamp) VALUES (?,?,?,?)"
);

const getByIdStatement = getDB().prepare(
  "SELECT * FROM messages WHERE message_id = ?"
);

const getLatestStatement = getDB().prepare(
  "SELECT * FROM messages ORDER BY message_id DESC LIMIT 1"
);

const getOldestStatement = getDB().prepare(
  "SELECT * FROM messages ORDER BY message_id ASC LIMIT 1"
);

const countStmt = getDB().prepare(`
  SELECT COUNT(*) as count FROM messages
`);

const deleteOldStmt = getDB().prepare(`
  DELETE FROM messages
  WHERE message_id IN (
    SELECT message_id FROM messages
    ORDER BY message_id ASC
    LIMIT ?
  )
`);

const randomByOffsetStmt = getDB().prepare(
  "SELECT * FROM messages LIMIT 1 OFFSET ?"
);

export function insertMessage(
  message_id: string,
  username: string,
  message: string,
  timestamp = Date.now()
): MessageRow {
  insertStatement.run(message_id, username, message, timestamp);

  pruneIfNeeded();

  return {
    message_id,
    username,
    message,
    timestamp,
  };
}

const MAX_MESSAGES = 1_000_000;
const PRUNE_BATCH_SIZE = 10_000;

export function pruneIfNeeded() {
  const { count } = countStmt.get() as { count: number };

  if (count > MAX_MESSAGES) {
    deleteOldStmt.run(PRUNE_BATCH_SIZE);
  }
}

export function getMessageById(id: number) {
  return getByIdStatement.get(id) as MessageRow | undefined;
}

export function getLatestMessage() {
  return getLatestStatement.get() as MessageRow | undefined;
}

export function getOldestMessage() {
  return getOldestStatement.get() as MessageRow | undefined;
}

export function getRandomMessage() {
  const db = getDB();

  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM messages")
    .get() as { count: number };
  if (count === 0) return undefined;

  const offset = Math.floor(Math.random() * count);

  const msg = db
    .prepare("SELECT * FROM messages LIMIT 1 OFFSET ?")
    .get(offset) as MessageRow;
  return msg;
}

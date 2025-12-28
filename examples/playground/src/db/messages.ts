import { getDB } from "./sqlite";

export interface MessageRow {
  message_id: number;
  username: string;
  message: string;
  timestamp: number;
}

const insertStatement = () =>
  getDB().prepare(
    "INSERT INTO messages (username, message, timestamp) VALUES (?,?,?)"
  );

const getByIdStatement = () =>
  getDB().prepare("SELECT * FROM messages WHERE message_id = ?");

const getLatestStatement = () =>
  getDB().prepare("SELECT * FROM messages ORDER BY message_id DESC LIMIT 1");

const getOldestStatement = () =>
  getDB().prepare("SELECT * FROM messages ORDER BY message_id ASC LIMIT 1");

const getRandomStatement = () =>
  getDB().prepare("SELECT * FROM messages ORDER BY RANDOM() LIMIT 1");

export function insertMessage(
  username: string,
  message: string,
  timestamp = Date.now()
) {
  const result = insertStatement().run(username, message, timestamp);
  return Number(result.lastInsertRowid);
}

export function getMessageById(id: number) {
  return getByIdStatement().get(id) as MessageRow | undefined;
}

export function getLatestMessage() {
  return getLatestStatement().get() as MessageRow | undefined;
}

export function getOldestMessage() {
  return getOldestStatement().get() as MessageRow | undefined;
}

export function getRandomMessage() {
  return getRandomStatement().get() as MessageRow | undefined;
}

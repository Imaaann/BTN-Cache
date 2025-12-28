import {
  getLatestMessage,
  getOldestMessage,
  getRandomMessage,
  MessageRow,
} from "../db/messages";

export type ReadEventType =
  | "readAfterWrite"
  | "randomRead"
  | "oldRead"
  | "newRead"
  | "popularRead";

export interface ReadPattern {
  readAfterWrite: number;
  randomRead: number;
  oldRead: number;
  newRead: number;
  popularRead: number;
}

export function pickReadFunction(
  type: ReadEventType
): () => MessageRow | undefined {
  switch (type) {
    case "readAfterWrite":
      return getLatestMessage;
    case "randomRead":
      return getRandomMessage;
    case "oldRead":
      return getOldestMessage;
    case "newRead":
      return getLatestMessage;
    case "popularRead":
      return getRandomMessage;
  }
}

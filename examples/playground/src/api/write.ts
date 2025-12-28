import { Router } from "express";
import { insertMessage, MessageRow } from "../db/messages";
import { WriteStrategyExecutor } from "../strategy";
import { ulid } from "ulid";

export function createWriteRouter(writer: WriteStrategyExecutor<MessageRow>) {
  const router = Router();
  router.get("/", async (_req, res) => {
    const start = performance.now();

    const message: MessageRow = {
      message_id: ulid(),
      username: "stress_writer",
      message: Math.random().toString(36),
      timestamp: Date.now(),
    };

    await writer.write(
      message,
      (m) => `msg:${m.message_id}`,
      (m) => insertMessage(m.message_id, m.username, m.message, m.timestamp)
    );

    const time = performance.now() - start;

    res.json({
      timeMs: time,
    });
  });

  return router;
}

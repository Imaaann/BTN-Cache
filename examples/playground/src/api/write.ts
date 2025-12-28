import { Router } from "express";
import { insertMessage, MessageRow } from "../db/messages";
import { WriteStrategyExecutor } from "../strategy";

export function createWriteRouter(writer: WriteStrategyExecutor<MessageRow>) {
  const router = Router();
  router.get("/", async (_req, res) => {
    const start = performance.now();

    const message: MessageRow = {
      message_id: 0,
      username: "stress_writer",
      message: Math.random().toString(36),
      timestamp: Date.now(),
    };

    await writer.write(
      message,
      (m) => `msg:${m.message_id}`,
      (m) => insertMessage(m.username, m.message, m.timestamp)
    );

    const time = performance.now() - start;

    res.json({
      timeMs: time,
    });
  });

  return router;
}

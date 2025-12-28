import { Router } from "express";
import { Cache } from "../cache/Cache";
import { getRandomMessage, MessageRow } from "../db/messages";
import { readWithStrategy } from "../strategy";

export function createReadRouter(
  cache: Cache<MessageRow>,
  getReadStrategy: () => "lazy" | "refresh"
) {
  const router = Router();

  router.get("/", async (_req, res) => {
    const start = performance.now();
    const key = `random:${Date.now()}:${Math.random()}`;
    const message = await readWithStrategy(getReadStrategy(), cache, key, () =>
      getRandomMessage()
    );

    const time = performance.now() - start;
    res.json({
      data: message,
      timeMs: time,
    });
  });

  return router;
}

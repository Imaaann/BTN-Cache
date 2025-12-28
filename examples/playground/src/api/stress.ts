import { Router } from "express";
import { getStressEngine } from "../runtime/stress";
import type { Cache } from "../cache/Cache";
import type { MessageRow } from "../db/messages";
import { WriteStrategyExecutor } from "../strategy/write";

export function createStressRouter(
  cache: Cache<MessageRow>,
  writer: WriteStrategyExecutor<MessageRow>
) {
  const router = Router();
  const engine = getStressEngine(cache, writer);

  router.post("/", (req, res) => {
    const { reads, writes } = req.body as {
      reads: number;
      writes: number;
    };

    engine.configure({
      readsPerSecond: reads,
      writesPerSecond: writes,
    });

    engine.start();

    res.json({ success: true });
  });

  return router;
}

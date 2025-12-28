import { Router } from "express";
import { getStressEngine } from "../runtime/stress";
import type { Cache } from "../cache/Cache";
import type { MessageRow } from "../db/messages";
import { WriteStrategyExecutor } from "../strategy/write";

let unsafe = false;

export function createSafeRouter(
  cache: Cache<MessageRow>,
  writer: WriteStrategyExecutor<MessageRow>
) {
  const router = Router();
  const engine = getStressEngine(cache, writer);

  router.post("/", (req, res) => {
    unsafe = !!req.body.safe === false;

    if (!unsafe) {
      engine.configure({
        readsPerSecond: Math.min(engine["readsPerSecond"], 100),
        writesPerSecond: Math.min(engine["writesPerSecond"], 50),
      });
    }

    res.json({ unsafe });
  });

  return router;
}

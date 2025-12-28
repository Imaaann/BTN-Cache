import { Router } from "express";
import { getStressEngine } from "../runtime/stress";
import type { Cache } from "../cache/Cache";
import type { MessageRow } from "../db/messages";
import { WriteStrategyExecutor } from "../strategy/write";
import type { ReadPattern } from "../stress/patterns";

export function createStressPatternRouter(
  cache: Cache<MessageRow>,
  writer: WriteStrategyExecutor<MessageRow>
) {
  const router = Router();
  const engine = getStressEngine(cache, writer);

  router.post("/", (req, res) => {
    const pattern = req.body as ReadPattern;

    const sum = Object.values(pattern).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > 0.001) {
      return res.status(400).json({ error: "Read pattern must sum to 1" });
    }

    engine.configure({ readPattern: pattern });

    res.json({ success: true });
  });

  return router;
}

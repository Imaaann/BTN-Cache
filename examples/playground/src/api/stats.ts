import { Router } from "express";
import { getStressEngine } from "../runtime/stress";
import type { Cache } from "../cache/Cache";
import type { MessageRow } from "../db/messages";
import { WriteStrategyExecutor } from "../strategy/write";

export function createStatsRouter(
  cache: Cache<MessageRow>,
  writer: WriteStrategyExecutor<MessageRow>
) {
  const router = Router();
  const engine = getStressEngine(cache, writer);

  router.get("/", (_req, res) => {
    res.json({
      stress: engine.getMetrics(),
      cache: cache.stats(),
      writeBehindQueue: writer.getLag(),
    });
  });

  return router;
}

import { Router } from "express";
import { CacheManager } from "../cache/CacheManager";
import { RedisAdapter } from "../cache/redis";
import { BTNAdapter } from "../cache/btn";
import { createReadRouter } from "./read";
import {
  LoadingStrategies,
  WriteStrategies,
  WriteStrategyExecutor,
} from "../strategy";
import { createWriteRouter } from "./write";
import { MessageRow } from "../db/messages";
import { Cache } from "../cache/Cache";
import { createStressRouter } from "./stress";
import { createStressPatternRouter } from "./pattern";
import { createStatsRouter } from "./stats";
import { createSafeRouter } from "./safe";

export function createApi(
  cache: Cache<MessageRow>,
  writer: WriteStrategyExecutor<MessageRow>
) {
  const router = Router();

  router.use("/stress", createStressRouter(cache, writer));
  router.use("/stress/pattern", createStressPatternRouter(cache, writer));
  router.use("/stats", createStatsRouter(cache, writer));
  router.use("/safe", createSafeRouter(cache, writer));

  router.use(
    "/read",
    createReadRouter(cache, () => strategies.read)
  );
  router.use("/write", createWriteRouter(writer));

  return router;
}

const cache = new CacheManager<MessageRow>(
  "BTN",
  () => new BTNAdapter(),
  () => new RedisAdapter("redis://localhost:6379", "demo:")
);

const strategies: {
  read: LoadingStrategies;
  write: WriteStrategies;
} = {
  read: "lazy",
  write: "through",
};

const apiRouter = createApi(
  cache,
  new WriteStrategyExecutor(cache, strategies.write)
);

/**
 * POST /api/cache/switch
 * {backend: "BTN" | "redis"}
 */
apiRouter.post("/cache/switch", (req, res) => {
  const { backend } = req.body;
  if (backend !== "BTN" && backend !== "redis") {
    return res.status(400).json({ error: "Invalid backend" });
  }

  cache.switchBackend(backend);
  res.json({ ok: true, backend });
});

/**
 * PUT /api/cache/configure
 * {"maxkeys": 100, "evictionPolicy": "LRU"}
 */
apiRouter.put("/cache/configure", (req, res) => {
  cache.configure(req.body);
  res.json({ ok: true });
});

export default apiRouter;

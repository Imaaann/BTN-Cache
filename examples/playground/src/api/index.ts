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

export const apiRouter = Router();

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
  write: "aside",
};

const readRouter = createReadRouter(cache, () => strategies.read);
const writeRouter = createWriteRouter(
  new WriteStrategyExecutor(cache, strategies.write)
);

apiRouter.use("/read", readRouter);
apiRouter.use("/write", writeRouter);

/**
 * GET /api/stats
 */
apiRouter.get("/stats", async (_req, res) => {
  res.json({
    backend: cache.current(),
    stats: cache.stats(),
  });
});

/**
 * POST /api/switch
 * {backend: "BTN" | "redis"}
 */
apiRouter.post("/switch", (req, res) => {
  const { backend } = req.body;
  if (backend !== "BTN" && backend !== "redis") {
    return res.status(400).json({ error: "Invalid backend" });
  }

  cache.switchBackend(backend);
  res.json({ ok: true, backend });
});

/**
 * PUT /api/configure
 * {"maxkeys": 100, "evictionPolicy": "LRU"}
 */
apiRouter.put("/configure", (req, res) => {
  cache.configure(req.body);
  res.json({ ok: true });
});

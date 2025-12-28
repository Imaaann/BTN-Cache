import { Router } from "express";
import { CacheManager } from "../cache/CacheManager";
import { RedisAdapter } from "../cache/redis";
import { BTNAdapter } from "../cache/btn";

type TestValue = any;

export const apiRouter = Router();

const cache = new CacheManager<TestValue>(
  "BTN",
  () => new BTNAdapter(),
  () => new RedisAdapter("redis://localhost:6379", "demo:")
);

/**
 * GET /api/get?key=goopy
 */
apiRouter.get("/get", async (req, res) => {
  const key = req.query.key as string;
  if (!key) return res.status(400).json({ error: "Key required" });

  const value = await cache.get(key);
  if (!value) {
    return res.json({ key, message: "Cache Miss" });
  }
  res.json({ key, value });
});

/**
 * POST /api/set
 * { "key": "Bloop", "value": 123}
 */
apiRouter.post("/set", async (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: "Key required" });

  await cache.set(key, value);
  res.json({ ok: true });
});

/**
 * DELETE /api/del?key=foo
 */
apiRouter.delete("/del", async (req, res) => {
  const key = req.query.key as string;
  if (!key) return res.status(400).json({ error: "Key required" });

  await cache.del(key);
  res.json({ ok: true });
});

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

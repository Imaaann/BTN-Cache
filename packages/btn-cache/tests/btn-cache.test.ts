import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { BTNCache } from "@btn/cache";

describe("BTNCache - basic behavior", () => {
  let cache: BTNCache<number>;

  beforeEach(() => {
    cache = new BTNCache<number>({
      invalidationPolicy: "NONE",
    });
  });

  afterEach(() => {
    cache.close();
  });

  it("sets and gets values", () => {
    cache.set("a", 1);
    expect(cache.get("a")).toBe(1);
  });

  it("returns undefined for missing keys", () => {
    expect(cache.get("missing")).toBeUndefined();
  });

  it("has() reflects presence", () => {
    cache.set("x", 42);
    expect(cache.has("x")).toBe(true);
    expect(cache.has("y")).toBe(false);
  });

  it("take() removes and returns value", () => {
    cache.set("a", 10);
    expect(cache.take("a")).toBe(10);
    expect(cache.get("a")).toBeUndefined();
  });
});

describe("BTNCache - statistics", () => {
  let cache: BTNCache<number>;

  beforeEach(() => {
    cache = new BTNCache<number>({ invalidationPolicy: "NONE" });
  });

  afterEach(() => cache.close());

  it("tracks hits and misses", () => {
    cache.set("a", 1);
    cache.get("a");
    cache.get("a");
    cache.get("b");

    const stats = cache.getStats();

    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.keys).toBe(1);
  });

  it("flushStats resets stats but not data", () => {
    cache.set("a", 1);
    cache.get("a");

    cache.flushStats();

    const stats = cache.getStats();
    expect(stats.hits).toBe(0);
    expect(cache.get("a")).toBe(1);
  });
});

describe("BTNCache - many operations", () => {
  let cache: BTNCache<number>;

  beforeEach(() => {
    cache = new BTNCache<number>({ invalidationPolicy: "NONE" });
  });

  afterEach(() => cache.close());

  it("many_set inserts all values", () => {
    cache.many_set({
      a: { data: 1 },
      b: { data: 2 },
    });

    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBe(2);
  });

  it("many_get returns existing keys only", () => {
    cache.set("a", 1);
    const result = cache.many_get(["a", "b"]);

    expect(result).toEqual({ a: 1 });
  });
});

describe("BTNCache - TTL invalidation", () => {
  let cache: BTNCache<number>;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new BTNCache<number>({
      invalidationPolicy: "TTL",
      stdTTL: 1000,
      checkPeriod: 500,
      deleteOnExpire: true,
    });
  });

  afterEach(() => {
    cache.close();
    vi.useRealTimers();
  });

  it("expires keys after TTL", () => {
    cache.set("a", 1);
    vi.advanceTimersByTime(1500);

    expect(cache.get("a")).toBeUndefined();
  });

  it("emits expired event", () => {
    const spy = vi.fn();
    cache.on("expired", spy);

    cache.set("a", 1);
    vi.advanceTimersByTime(1500);

    expect(spy).toHaveBeenCalled();
  });

  it("ttl() updates TTL", () => {
    cache.set("a", 1, 5000);
    cache.ttl("a", 100);

    vi.advanceTimersByTime(200);
    expect(cache.get("a")).toBeUndefined();
  });
});

describe("BTNCache - EVENT invalidation", () => {
  let cache: BTNCache<number>;

  beforeEach(() => {
    cache = new BTNCache<number>({
      invalidationPolicy: "EVENT",
      predicate: (data) => data.numberOfAccess >= 2,
      deleteOnExpire: true,
    });
  });

  afterEach(() => cache.close());

  it("invalidates data when predicate returns true", () => {
    cache.set("a", 1);
    cache.get("a");
    cache.get("a"); // second access

    expect(cache.get("a")).toBeUndefined();
  });
});

describe("BTNCache - eviction policies", () => {
  afterEach(() => vi.useRealTimers());

  it("evicts using FIFO", () => {
    const cache = new BTNCache<number>({
      invalidationPolicy: "NONE",
      evictionPolicy: "FIFO",
      maxKeys: 2,
    });

    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);

    expect(cache.has("a")).toBe(false);
    expect(cache.has("b")).toBe(true);
    expect(cache.has("c")).toBe(true);

    cache.close();
  });

  it("evicts using LRU", () => {
    const cache = new BTNCache<number>({
      invalidationPolicy: "NONE",
      evictionPolicy: "LRU",
      maxKeys: 2,
    });

    cache.set("a", 1);
    cache.set("b", 2);
    cache.get("a"); // make b least recently used
    cache.set("c", 3);

    expect(cache.has("b")).toBe(false);
    cache.close();
  });

  it("evicts using LFU", () => {
    const cache = new BTNCache<number>({
      invalidationPolicy: "NONE",
      evictionPolicy: "LFU",
      maxKeys: 2,
    });

    cache.set("a", 1);
    cache.set("b", 2);
    cache.get("a");
    cache.get("a"); // a more frequently used
    cache.set("c", 3);

    expect(cache.has("b")).toBe(false);
    cache.close();
  });
});

describe("BTNCache – maintenance", () => {
  let cache: BTNCache<number>;

  beforeEach(() => {
    cache = new BTNCache<number>({ invalidationPolicy: "NONE" });
  });

  afterEach(() => cache.close());

  it("flushAll clears data and stats", () => {
    cache.set("a", 1);
    cache.get("a");

    cache.flushAll();

    expect(cache.keys()).toEqual([]);
    expect(cache.getStats().keys).toBe(0);
  });

  it("keys() returns all keys", () => {
    cache.set("a", 1);
    cache.set("b", 2);

    expect(cache.keys().sort()).toEqual(["a", "b"]);
  });

  it("setSettings updates behavior", () => {
    cache.setSettings({ maxKeys: 1 });
    cache.set("a", 1);
    cache.set("b", 2);

    expect(cache.keys().length).toBe(1);
  });
});

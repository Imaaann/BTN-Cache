import Redis from "ioredis";
import { Cache, ConfigureAdapter, EvictionPolicy } from "./Cache";

export class RedisAdapter<T> implements Cache<T> {
  private redis: Redis;
  private prefix: string;

  private maxKeys: number | undefined;
  private evictionPolicy: EvictionPolicy | undefined;

  private accessTime = new Map<string, number>(); // for LRU
  private accessCount = new Map<string, number>(); // for LFU
  private insertionOrder: string[] = []; // for FIFO

  private keys = new Set<string>();

  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(url?: string, prefix?: string) {
    this.redis = new Redis(url ?? "redis://localhost:6379");
    this.prefix = prefix ?? "cache:";
  }

  async get(key: string): Promise<T | undefined> {
    const redisKey = this.k(key);
    const raw = await this.redis.get(redisKey);
    const now = Date.now();

    if (raw == null) {
      this.misses++;
      return undefined;
    }

    this.accessTime.set(key, now);
    this.accessCount.set(key, (this.accessCount.get(key) ?? 0) + 1);

    this.hits++;
    return JSON.parse(raw) as T;
  }

  async set(key: string, value: T) {
    const redisKey = this.k(key);
    await this.redis.set(redisKey, JSON.stringify(value));

    if (!this.keys.has(key)) {
      this.insertionOrder.push(key);
      this.accessTime.set(key, Date.now());
      this.accessCount.set(key, 1);
    }

    this.keys.add(redisKey);

    if (this.maxKeys !== undefined && this.keys.size > this.maxKeys) {
      this.evictOne();
    }
  }

  async del(key: string) {
    const redisKey = this.k(key);
    const removed = await this.redis.del(redisKey);

    if (removed > 0) {
      this.keys.delete(redisKey);
      this.accessTime.delete(key);
      this.accessCount.delete(key);

      const idx = this.insertionOrder.indexOf(key);
      if (idx !== -1) {
        this.insertionOrder.splice(idx, 1);
      }
    }
  }

  configure(cfg: ConfigureAdapter<T>): void {
    if (cfg.maxKeys !== undefined) {
      this.maxKeys = cfg.maxKeys;
    }

    if (cfg.evictionPolicy !== undefined) {
      this.evictionPolicy = cfg.evictionPolicy;
    }
  }

  stats(): { hits: number; misses: number; evictions: number } {
    return {
      hits: this.hits,
      misses: this.hits,
      evictions: this.evictions,
    };
  }

  private evictOne() {
    if (this.keys.size === 0) return;

    let keyToEvict: string | undefined;

    switch (this.evictionPolicy) {
      case "RANDOM": {
        const index = Math.floor(Math.random() * this.keys.size);
        keyToEvict = Array.from(this.keys)[index];
        break;
      }

      case "LRU": {
        let oldestTime = Infinity;
        for (const key of this.keys) {
          const time = this.accessTime.get(key) ?? Infinity;
          if (time < oldestTime) {
            oldestTime = time;
            keyToEvict = key;
          }
        }
        break;
      }

      case "LFU": {
        let lowestCount = Infinity;
        for (const key of this.keys) {
          const count = this.accessCount.get(key) ?? Infinity;
          if (count < lowestCount) {
            lowestCount = count;
            keyToEvict = key;
          }
        }
        break;
      }

      case "FIFO": {
        keyToEvict = this.insertionOrder.shift();
        break;
      }
    }

    if (!keyToEvict) return;

    this.redis.del(keyToEvict);
    this.keys.delete(keyToEvict);
    this.accessTime.delete(keyToEvict);
    this.accessCount.delete(keyToEvict);
    this.evictions++;
  }

  private k(key: string) {
    return this.prefix + key;
  }
}

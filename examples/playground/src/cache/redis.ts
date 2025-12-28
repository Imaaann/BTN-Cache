import Redis from "ioredis";
import { Cache, ConfigureAdapter, EvictionPolicy } from "./Cache";

export class RedisAdapter<T> implements Cache<T> {
  private redis: Redis;
  private prefix: string;

  private maxKeys: number | undefined;
  private evictionPolicy: EvictionPolicy | undefined;

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

    if (raw == null) {
      this.misses++;
      return undefined;
    }

    this.hits++;
    return JSON.parse(raw) as T;
  }

  async set(key: string, value: T) {
    const redisKey = this.k(key);
    await this.redis.set(redisKey, JSON.stringify(value));

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
    const key = this.keys.values().next().value ?? "";
    this.redis.del(key);
    this.keys.delete(key);
    this.evictions++;
  }

  private k(key: string) {
    return this.prefix + key;
  }
}

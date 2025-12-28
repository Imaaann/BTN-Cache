import { BTNCache } from "@btn/cache";
import { Cache, ConfigureAdapter } from "./Cache.js";

export class CacheManager<T> implements Cache<T> {
  private cache: Cache<T>;
  private backend: "BTN" | "redis";

  private readonly btnFactory: () => Cache<T>;
  private readonly redisFactory: () => Cache<T>;

  constructor(
    defaultBackend: "BTN" | "redis",
    btnFactory: () => Cache<T>,
    redisFactory: () => Cache<T>
  ) {
    this.btnFactory = btnFactory;
    this.redisFactory = redisFactory;
    this.backend = defaultBackend;

    this.cache =
      this.backend === "BTN" ? this.btnFactory() : this.redisFactory();
  }

  get(key: string): T | Promise<T | undefined> | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): Promise<void> | void | undefined {
    return this.cache.set(key, value);
  }

  del(key: string): Promise<void> | void | undefined {
    this.cache.del(key);
  }

  stats(): { hits: number; misses: number; evictions: number } {
    return this.cache.stats();
  }

  configure(cfg: ConfigureAdapter<T>): void {
    this.cache.configure(cfg);
  }

  switchBackend(next: "BTN" | "redis") {
    if (next === this.backend) return;

    this.cache = next === "BTN" ? this.btnFactory() : this.redisFactory();

    this.backend = next;
  }

  current() {
    return this.backend;
  }
}

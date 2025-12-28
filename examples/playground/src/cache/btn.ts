import { CacheStats, CacheOptionsInput, BTNCache } from "@btn/cache";
import { Cache, ConfigureAdapter } from "./Cache";

export class BTNAdapter<T> implements Cache<T> {
  private cache: BTNCache<T>;

  constructor() {
    this.cache = new BTNCache();
  }

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }

  del(key: string): void {
    this.cache.del([key]);
  }

  stats(): {
    hits: number;
    misses: number;
    evictions: number;
  } {
    return this.cache.getStats();
  }

  configure(cfg: ConfigureAdapter<T>): void {
    this.cache.setSettings(cfg);
  }
}

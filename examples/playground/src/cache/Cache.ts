import { CacheOptionsInput, CacheStats } from "@btn/cache";

export type EvictionPolicy = "LRU" | "FIFO" | "LFU" | "RANDOM";

export interface ConfigureAdapter<T = unknown> {
  maxKeys?: number;
  evictionPolicy?: EvictionPolicy;
}

export interface Cache<T> {
  get(key: string): Promise<T | undefined> | T | undefined;
  set(key: string, value: T): Promise<void> | void | undefined;
  del(key: string): Promise<void> | void | undefined;
  stats(): {
    hits: number;
    misses: number;
    evictions: number;
  };
  configure(cfg: ConfigureAdapter<T>): void;
}

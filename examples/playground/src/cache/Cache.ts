import { CacheOptionsInput, CacheStats } from "@btn/cache";

export interface Cache {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  del(key: string): Promise<void>;
  stats(): CacheStats;
  configure(cfg: CacheOptionsInput<any>): void;
}

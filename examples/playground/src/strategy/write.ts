import { Cache } from "../cache/Cache";

export type WriteStrategies = "through" | "aside" | "behind";

type DBWriter<T> = (value: T) => void;
type KeyResolve<T> = (value: T) => string;

export class WriteStrategyExecutor<T> {
  private cache: Cache<T>;
  private strategy: WriteStrategies;
  private queue: T[] = [];

  constructor(cache: Cache<T>, strategy: WriteStrategies) {
    this.cache = cache;
    this.strategy = strategy;
  }

  setStrategy(strategy: WriteStrategies) {
    this.strategy = strategy;
  }

  getLag() {
    return this.queue.length;
  }

  async write(value: T, resolveKey: KeyResolve<T>, writeDB: DBWriter<T>) {
    const key = resolveKey(value);

    switch (this.strategy) {
      case "through":
        writeDB(value);
        await this.cache.set(key, value);
        break;
      case "aside":
        writeDB(value);
        await this.cache.del(key);
        break;
      case "behind":
        await this.cache.set(key, value);
        this.queue.push(value);
        break;
    }
  }

  flush(writeDB: DBWriter<T>) {
    while (this.getLag() > 0) {
      const value = this.queue.shift()!;
      writeDB(value);
    }
  }
}

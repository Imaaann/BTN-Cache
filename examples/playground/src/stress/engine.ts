import { insertMessage, MessageRow } from "../db/messages";
import { pickReadFunction, ReadPattern } from "./patterns";
import { Cache } from "../cache/Cache";
import { readWithStrategy, WriteStrategyExecutor } from "../strategy";
import { createMetrics, Metrics } from "./metrics";

export interface StressOptions {
  readsPerSecond: number;
  writesPerSecond: number;
  readPattern: ReadPattern;
}

export class StressEngine {
  private cache: Cache<MessageRow>;
  private writer: WriteStrategyExecutor<MessageRow>;
  private metrics: Metrics;

  private readInterval?: NodeJS.Timeout;
  private writeInterval?: NodeJS.Timeout;

  private lastWritten: MessageRow = {
    message_id: 0,
    username: "stress-writer",
    message: "FIRST MESSAGE",
    timestamp: Date.now(),
  };

  private readPattern: ReadPattern;
  private readsPerSecond: number;
  private writesPerSecond: number;

  constructor(
    cache: Cache<MessageRow>,
    writer: WriteStrategyExecutor<MessageRow>
  ) {
    this.cache = cache;
    this.writer = writer;
    this.metrics = createMetrics();
    this.readPattern = {
      readAfterWrite: 0.2,
      randomRead: 0.4,
      oldRead: 0.1,
      newRead: 0.2,
      popularRead: 0.1,
    };
    this.readsPerSecond = 10;
    this.writesPerSecond = 5;
  }

  start() {
    this.stop();

    const readIntervalMs = 1000 / this.readsPerSecond;
    this.readInterval = setInterval(async () => {
      const start = performance.now();
      const type = this.pickReadType();

      const loader =
        type === "readAfterWrite" && this.lastWritten
          ? () => this.lastWritten
          : pickReadFunction(type);

      await readWithStrategy(
        "lazy",
        this.cache,
        `${Math.floor(Math.random() * this.lastWritten.message_id)}`,
        loader
      );

      this.metrics.readCount++;
      this.metrics.readTime += performance.now() - start;
    }, readIntervalMs);

    // Writes
    const writeIntervalMs = 1000 / this.writesPerSecond;
    this.writeInterval = setInterval(async () => {
      const start = performance.now();

      const input: MessageRow = {
        message_id: this.lastWritten.message_id + 1,
        username: "stress",
        message: Math.random().toString(36).substring(2),
        timestamp: Date.now(),
      };

      await this.writer.write(
        input,
        (m) => `${m.message_id}`,
        (m) => insertMessage(m.message_id, m.username, m.message, m.timestamp)
      );

      this.lastWritten = input;
      this.metrics.writeCount++;
      this.metrics.writeTime += performance.now() - start;
    }, writeIntervalMs);
  }

  stop() {
    if (this.readInterval) clearInterval(this.readInterval);
    if (this.writeInterval) clearInterval(this.writeInterval);
  }

  private pickReadType(): keyof ReadPattern {
    const rnd = Math.random();
    let sum = 0;
    for (const k of Object.keys(this.readPattern) as (keyof ReadPattern)[]) {
      sum += this.readPattern[k];
      if (rnd < sum) return k;
    }
    return "randomRead";
  }

  getMetrics(): Metrics {
    return this.metrics;
  }

  configure(options: Partial<StressOptions>) {
    if (options.readsPerSecond !== undefined)
      this.readsPerSecond = options.readsPerSecond;
    if (options.writesPerSecond !== undefined)
      this.writesPerSecond = options.writesPerSecond;
    if (options.readPattern !== undefined)
      this.readPattern = options.readPattern;
  }
}

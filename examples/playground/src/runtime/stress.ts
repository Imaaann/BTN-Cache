import { StressEngine } from "../stress/engine";
import type { Cache } from "../cache/Cache";
import type { MessageRow } from "../db/messages";
import { WriteStrategyExecutor } from "../strategy/write";

let engine: StressEngine | null = null;

export function getStressEngine(
  cache: Cache<MessageRow>,
  writer: WriteStrategyExecutor<MessageRow>
) {
  if (!engine) {
    engine = new StressEngine(cache, writer);
  }
  return engine;
}

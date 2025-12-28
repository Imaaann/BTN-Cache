import { Cache } from "../cache/Cache";
import { MessageRow } from "../db/messages";
import { WriteStrategies, WriteStrategyExecutor } from "../strategy";

export function createWriteExecutor(
  cache: Cache<MessageRow>,
  strategy: WriteStrategies
) {
  return new WriteStrategyExecutor<MessageRow>(cache, strategy);
}

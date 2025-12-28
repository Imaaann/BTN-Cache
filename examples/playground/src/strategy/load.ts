import { Cache } from "../cache/Cache";

type Loader<T> = () => T | undefined;

export type LoadingStrategies = "lazy" | "refresh";

export async function readWithStrategy<T>(
  strategy: LoadingStrategies,
  cache: Cache<T>,
  key: string,
  loader: Loader<T>
): Promise<T | undefined> {
  const cached = await cache.get(key);
  if (cached !== undefined) {
    if (strategy == "refresh") {
      const fresh = loader();
      if (fresh !== undefined) {
        await cache.set(key, fresh);
        return fresh;
      }
    }

    return cached;
  }

  const loaded = loader();
  if (loaded !== undefined) {
    await cache.set(key, loaded);
  }

  return loaded;
}

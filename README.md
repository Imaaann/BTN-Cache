# Overview

BTN Cache (Better than nothing cache) is a naive implementation of an in memory cache inspired by other libraries such as node-cache.

This library allows you to integrate caching to any of your existing systems.

# Usage

---

## Creating a new cache

```ts
const myCache = new BTNCache();
```

### Options

- `evictionPolicy`: one of `LRU, LFU, FIFO, RANDOM`.
- `invalidationPolicy` (default TTL): one of `NONE, TTL, EVENT`.
  - The TTL option adds the optional argument `stdTTL` which is set to 500 seconds.
  - The Event option adds the optional argument `event` which is a callback that gives the state of the checked data and and returns if true if the data is considered invalid.
- `deleteOnExpire` (default true): whether variables get automatically deleted with they are invalidated.
- `maxKeys` (default -1): The maximum number of keys in the cache.
- `useClones` (default true): If the cache should store a clone of the data or a reference.
- `checkPeriod`: how often does the cache run a check for invalid data.

## Storing a key

You can store a key by using the set method.

```ts
const obj = { name: "Special", test: 33 };
success = myCache.set("Key", obj, 5000); // The last argument is an overwrite only in the TTL system
```

You can store multiple keys using mset

```ts
const obj = { name: "Special1", test: 33 };
const success = myCache.many_set([
  { key: "1", val = obj, ttl = 5000 },
  { key: "3", val = obj },
  { key: "2", val = obj },
]);
```

## Retrieve a key

You can retrieve a key by using the get method.

```ts
const value = myCache.get("Special");

if (value == undefined) {
  // Handle cache miss
}

// value = {key: "Special", value=obj}
```

You can retrieve multiple using te many_get method.

```ts
const value = myCache.many_get(["1", "2", "3"]);
/*
	{
		"1": obj,
		"2": obj
	}
*/
```

## Take a key

Taking a key means getting it an removing it from the cache

```ts
myCache.set("myKey", "myValue");
myCache.has("myKey"); // returns true because the key is cached right now
value = myCache.take("myKey"); // value === "myValue"; this also deletes the key
myCache.has("myKey"); // returns false because the key has been deleted
```

## Delete a key

You can delete a key using the delete method. will return how many records are deleted.

```ts
const value = myCache.del(["1"]);
// 1

const value2 = myCache.del(["1", "2"]);
// 1, since "1" is already deleted

const value3 = myCache.del(["3", "Special"]);
// 2
```

## Change TTL

You can change the TLL of a key using the ttl method.

```ts
changed = myCache.ttl("Special1", 30);
// true
```

You can get the TTL of a key using the getTTL method.

```ts
// the ttl is stored in as a UNIX time stamp.

ttl = myCache.getTTL("Key");
// time stamp
```

## List Keys

You can list all keys using the keys method.

```ts
keys = myCache.keys();
// ["..."]
```

## Has key

You can check if a key exists using the has method

```ts
hasSpecial = myCache.has("Special");
// true
```

## Stats

You can get the statistics of the cache using the getStats method.

```ts
stats = myCache.getStats();
/*
	{
		keys: 0,
		hits: 0,
		misses: 0,
		ksize: 0, // Key size in bytes
		vsize: 0, // Value size in bytes
	}
*/
```

## Flushing Data

You can flush all data or just the stats using flushAll and flushStats respectively

```ts
myCache.flushAll();
myCache.flushStats();
```

## Switching Behavior

You can switch the cache's behavior at any moment

```ts
myCache.setSettings({
  evictionPolicy: "None",
  invalidationPolicy: "TTL",
});
```

## Close the cache

Once you are done with the cache you must close it to remove all the timers.

```ts
myCache.close();
```

## Events

Multiple events are exposed to be set when the cache does anything

Here is a full list with each payload

| Event           | When it happens                            | Payload             |
| --------------- | ------------------------------------------ | ------------------- |
| set             | When a key is first set                    | `key`, `value`      |
| del             | When is removed or expires                 | `key`, `value`      |
| get             | When a key is accessed                     | `key`, `value`      |
| expired         | When a key is expired                      | `key`, `value+meta` |
| evicted         | When a key is evicted                      | `key`, `value`      |
| miss            | When a cache miss happens                  | `key`               |
| flush           | When the cache is flushed                  |                     |
| flush-stats     | When the stats are flushed                 |                     |
| settings-change | When the settings of the cache are changed |                     |
| error           | When an error happens in the cache         | `message`           |

You can set the settings using the following

```ts
myCache.on("set", (key, value) => {});
```

You can detach the current event using the following.

```ts
myCache.detach("set");
```

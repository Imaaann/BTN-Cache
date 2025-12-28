# In-Memory Cache Playground API

This API provides a local playground for experimenting with cache behavior under load, including cache backends, eviction policies, loading strategies, and write strategies.

All endpoints are prefixed with:

```
/api
```

---

## Cache Management

### Switch Cache Backend

**POST** `/api/cache/switch`

Switch between BTNCache and Redis.

```json
{
  "backend": "BTN" | "redis"
}
```

**Response**

```json
{
  "ok": true,
  "backend": "BTN"
}
```

---

### Configure Cache

**PUT** `/api/cache/configure`

Configure cache behavior such as max keys and eviction policy.

```json
{
  "maxKeys": 1000,
  "evictionPolicy": "LRU" | "LFU" | "FIFO" | "RANDOM"
}
```

**Response**

```json
{
  "ok": true
}
```

---

## Read & Write Operations

### Read Message

**GET** `/api/read`

Performs a read using the currently active loading strategy.

**Response**

```json
{
  "data": {
    "message_id": 123,
    "username": "alice",
    "message": "hello",
    "timestamp": 1690000000
  },
  "timeMs": 3.42
}
```

---

### Write Message

**GET** `/api/write`

Performs a write using the currently active write strategy.

**Response**

```json
{
  "timeMs": 5.87
}
```

---

## Stress Engine

### Start Stress Test

**POST** `/api/stress`

Starts a background stress loop.

```json
{
  "reads": 500,
  "writes": 200
}
```

- `reads`: reads per second
- `writes`: writes per second
- `dbSize`: logical database size for read targeting

**Response**

```json
{
  "ok": true
}
```

---

### Update Stress Patterns

**POST** `/api/stress/pattern`

Configures read distribution probabilities.

```json
{
  "readAfterWrite": 0.2,
  "randomRead": 0.3,
  "oldRead": 0.2,
  "newRead": 0.2,
  "popularRead": 0.1
}
```

> The sum must equal `1.0`

**Response**

```json
{
  "ok": true
}
```

---

## Statistics & Monitoring

### Cache and System Stats

**GET** `/api/stats`

Returns cache statistics and database lag (if applicable).

```json
{
  "cache": {
    "hits": 12000,
    "misses": 4300,
    "evictions": 210
  },
  "dbLag": 42
}
```

---

## Safety Controls

### Toggle Safe Mode

**POST** `/api/safe`

Enable or disable safety limits.

```json
{
  "safe": false
}
```

- `safe = false` allows unbounded CPU usage for stress testing

**Response**

```json
{
  "ok": true
}
```

# @fluxbot/sdk (dummy)

A **pre-launch** FluxBot SDK to help developers integrate with FluxBot-style APIs.

> This is intentionally a *dummy* SDK for direction + GitHub presence. The API surface may change.

## Install

```bash
npm i @fluxbot/sdk
```

## Usage

```ts
import { FluxBotClient } from '@fluxbot/sdk';

const client = new FluxBotClient({ baseUrl: 'http://127.0.0.1:8787' });

const health = await client.health();
console.log('health', health);

await client.start();

for await (const ev of client.pollEvents({ intervalMs: 1000 })) {
  console.log(ev.type, ev.mint, ev.signature);
}
```

## Included endpoints (dummy mapping)

- `GET /status` → `client.health()`
- `POST /start` → `client.start()`
- `POST /stop` → `client.stop()`
- `POST /panic-close` → `client.panicClose()`
- `GET /events?limit=...` → `client.events()`

## License
MIT

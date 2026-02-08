"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BotEventSchema: () => BotEventSchema,
  BotModeSchema: () => BotModeSchema,
  EventTypeSchema: () => EventTypeSchema,
  EventsResponseSchema: () => EventsResponseSchema,
  FluxBotClient: () => FluxBotClient,
  FluxBotError: () => FluxBotError,
  FluxBotHttpError: () => FluxBotHttpError,
  HealthSchema: () => HealthSchema,
  StartStopResponseSchema: () => StartStopResponseSchema
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var import_zod = require("zod");
var HealthSchema = import_zod.z.object({
  ok: import_zod.z.boolean().default(true),
  version: import_zod.z.string().optional(),
  uptimeSec: import_zod.z.number().optional(),
  rpc: import_zod.z.object({
    ok: import_zod.z.boolean().optional(),
    ms: import_zod.z.number().optional(),
    url: import_zod.z.string().optional()
  }).optional(),
  wss: import_zod.z.object({
    ok: import_zod.z.boolean().optional(),
    lastLogAtMs: import_zod.z.number().optional(),
    subscribed: import_zod.z.boolean().optional()
  }).optional()
});
var BotModeSchema = import_zod.z.enum(["paper", "live"]);
var StartStopResponseSchema = import_zod.z.object({ ok: import_zod.z.boolean(), started: import_zod.z.boolean().optional() });
var EventTypeSchema = import_zod.z.enum([
  "candidate",
  "gate_skip",
  "entry_skip",
  "enter_attempt",
  "enter_ok",
  "enter_fail",
  "exit_attempt",
  "exit_retry",
  "exit_ok",
  "exit_fail",
  "fast_exit",
  "rug_risk",
  "rug_confirm",
  "rpc_down"
]);
var BotEventSchema = import_zod.z.object({
  id: import_zod.z.string().optional(),
  ts: import_zod.z.number(),
  type: EventTypeSchema,
  mint: import_zod.z.string().optional(),
  signature: import_zod.z.string().optional(),
  message: import_zod.z.string().optional(),
  data: import_zod.z.record(import_zod.z.string(), import_zod.z.any()).optional()
});
var EventsResponseSchema = import_zod.z.object({ ok: import_zod.z.boolean().default(true), events: import_zod.z.array(BotEventSchema) });

// src/errors.ts
var FluxBotError = class extends Error {
  constructor(message, info) {
    super(message);
    this.info = info;
    this.name = "FluxBotError";
  }
};
var FluxBotHttpError = class extends FluxBotError {
  constructor(message, status, url, bodyText) {
    super(message, { status, url, bodyText });
    this.status = status;
    this.url = url;
    this.bodyText = bodyText;
    this.name = "FluxBotHttpError";
  }
};

// src/client.ts
function joinUrl(base, path) {
  return base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}
async function fetchJson(url, init, timeoutMs) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ac.signal });
    const text = await res.text();
    if (!res.ok) throw new FluxBotHttpError("HTTP error", res.status, url, text);
    return text ? JSON.parse(text) : {};
  } finally {
    clearTimeout(t);
  }
}
var FluxBotClient = class {
  baseUrl;
  apiKey;
  timeoutMs;
  constructor(opts) {
    this.baseUrl = opts.baseUrl;
    this.apiKey = opts.apiKey;
    this.timeoutMs = opts.timeoutMs ?? 15e3;
  }
  headers() {
    const h = { "content-type": "application/json" };
    if (this.apiKey) h["x-api-key"] = this.apiKey;
    return h;
  }
  async health() {
    const url = joinUrl(this.baseUrl, "status");
    const json = await fetchJson(url, { method: "GET", headers: this.headers() }, this.timeoutMs);
    const candidate = json?.status ?? json;
    return HealthSchema.parse(candidate);
  }
  async start() {
    const url = joinUrl(this.baseUrl, "start");
    const json = await fetchJson(url, { method: "POST", headers: this.headers(), body: "{}" }, this.timeoutMs);
    return StartStopResponseSchema.parse(json);
  }
  async stop() {
    const url = joinUrl(this.baseUrl, "stop");
    const json = await fetchJson(url, { method: "POST", headers: this.headers(), body: "{}" }, this.timeoutMs);
    return StartStopResponseSchema.parse(json);
  }
  async panicClose() {
    const url = joinUrl(this.baseUrl, "panic-close");
    const json = await fetchJson(url, { method: "POST", headers: this.headers(), body: "{}" }, this.timeoutMs);
    return StartStopResponseSchema.parse(json);
  }
  async events(limit = 200) {
    const url = joinUrl(this.baseUrl, `events?limit=${encodeURIComponent(String(limit))}`);
    const json = await fetchJson(url, { method: "GET", headers: this.headers() }, this.timeoutMs);
    return EventsResponseSchema.parse(json);
  }
  /** Convenience: stream events by polling. */
  async *pollEvents(params) {
    const intervalMs = params?.intervalMs ?? 1e3;
    const limit = params?.limit ?? 200;
    const seen = /* @__PURE__ */ new Set();
    while (!params?.stopSignal?.aborted) {
      const res = await this.events(limit);
      for (const ev of res.events) {
        const key = ev.id ? `id:${ev.id}` : `${ev.ts}:${ev.type}:${ev.signature ?? ""}:${ev.mint ?? ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        yield ev;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BotEventSchema,
  BotModeSchema,
  EventTypeSchema,
  EventsResponseSchema,
  FluxBotClient,
  FluxBotError,
  FluxBotHttpError,
  HealthSchema,
  StartStopResponseSchema
});
//# sourceMappingURL=index.cjs.map
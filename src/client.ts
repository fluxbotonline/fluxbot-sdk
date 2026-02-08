import { FluxBotHttpError } from './errors';
import {
  EventsResponse,
  EventsResponseSchema,
  FluxBotClientOptions,
  Health,
  HealthSchema,
  StartStopResponse,
  StartStopResponseSchema
} from './types';

function joinUrl(base: string, path: string) {
  return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}

async function fetchJson<T>(url: string, init: RequestInit, timeoutMs: number): Promise<T> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ac.signal });
    const text = await res.text();
    if (!res.ok) throw new FluxBotHttpError('HTTP error', res.status, url, text);
    return text ? (JSON.parse(text) as T) : ({} as T);
  } finally {
    clearTimeout(t);
  }
}

export class FluxBotClient {
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly timeoutMs: number;

  constructor(opts: FluxBotClientOptions) {
    this.baseUrl = opts.baseUrl;
    this.apiKey = opts.apiKey;
    this.timeoutMs = opts.timeoutMs ?? 15_000;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'content-type': 'application/json' };
    if (this.apiKey) h['x-api-key'] = this.apiKey;
    return h;
  }

  async health(): Promise<Health> {
    const url = joinUrl(this.baseUrl, 'status');
    const json = await fetchJson<any>(url, { method: 'GET', headers: this.headers() }, this.timeoutMs);
    // Accept both {status: {...}} and direct health object.
    const candidate = json?.status ?? json;
    return HealthSchema.parse(candidate);
  }

  async start(): Promise<StartStopResponse> {
    const url = joinUrl(this.baseUrl, 'start');
    const json = await fetchJson<any>(url, { method: 'POST', headers: this.headers(), body: '{}' }, this.timeoutMs);
    return StartStopResponseSchema.parse(json);
  }

  async stop(): Promise<StartStopResponse> {
    const url = joinUrl(this.baseUrl, 'stop');
    const json = await fetchJson<any>(url, { method: 'POST', headers: this.headers(), body: '{}' }, this.timeoutMs);
    return StartStopResponseSchema.parse(json);
  }

  async panicClose(): Promise<StartStopResponse> {
    const url = joinUrl(this.baseUrl, 'panic-close');
    const json = await fetchJson<any>(url, { method: 'POST', headers: this.headers(), body: '{}' }, this.timeoutMs);
    return StartStopResponseSchema.parse(json);
  }

  async events(limit = 200): Promise<EventsResponse> {
    const url = joinUrl(this.baseUrl, `events?limit=${encodeURIComponent(String(limit))}`);
    const json = await fetchJson<any>(url, { method: 'GET', headers: this.headers() }, this.timeoutMs);
    return EventsResponseSchema.parse(json);
  }

  /** Convenience: stream events by polling. */
  async *pollEvents(params?: { intervalMs?: number; limit?: number; stopSignal?: AbortSignal }) {
    const intervalMs = params?.intervalMs ?? 1000;
    const limit = params?.limit ?? 200;
    const seen = new Set<string>();

    while (!params?.stopSignal?.aborted) {
      const res = await this.events(limit);
      for (const ev of res.events) {
        const key = ev.id ? `id:${ev.id}` : `${ev.ts}:${ev.type}:${ev.signature ?? ''}:${ev.mint ?? ''}`;
        if (seen.has(key)) continue;
        seen.add(key);
        yield ev;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
}

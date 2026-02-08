import { z } from 'zod';

/**
 * Minimal types for a FluxBot-style API.
 * This SDK is intentionally "dummy" (pre-launch), but the shape matches the direction.
 */

export const HealthSchema = z.object({
  ok: z.boolean().default(true),
  version: z.string().optional(),
  uptimeSec: z.number().optional(),
  rpc: z
    .object({
      ok: z.boolean().optional(),
      ms: z.number().optional(),
      url: z.string().optional()
    })
    .optional(),
  wss: z
    .object({
      ok: z.boolean().optional(),
      lastLogAtMs: z.number().optional(),
      subscribed: z.boolean().optional()
    })
    .optional()
});
export type Health = z.infer<typeof HealthSchema>;

export const BotModeSchema = z.enum(['paper', 'live']);
export type BotMode = z.infer<typeof BotModeSchema>;

export const StartStopResponseSchema = z.object({ ok: z.boolean(), started: z.boolean().optional() });
export type StartStopResponse = z.infer<typeof StartStopResponseSchema>;

export const EventTypeSchema = z.enum([
  'candidate',
  'gate_skip',
  'entry_skip',
  'enter_attempt',
  'enter_ok',
  'enter_fail',
  'exit_attempt',
  'exit_retry',
  'exit_ok',
  'exit_fail',
  'fast_exit',
  'rug_risk',
  'rug_confirm',
  'rpc_down'
]);

export const BotEventSchema = z.object({
  id: z.string().optional(),
  ts: z.number(),
  type: EventTypeSchema,
  mint: z.string().optional(),
  signature: z.string().optional(),
  message: z.string().optional(),
  data: z.record(z.string(), z.any()).optional()
});
export type BotEvent = z.infer<typeof BotEventSchema>;

export const EventsResponseSchema = z.object({ ok: z.boolean().default(true), events: z.array(BotEventSchema) });
export type EventsResponse = z.infer<typeof EventsResponseSchema>;

export type FluxBotClientOptions = {
  baseUrl: string; // e.g. http://127.0.0.1:8787
  apiKey?: string;
  timeoutMs?: number;
};

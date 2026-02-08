import { z } from 'zod';

/**
 * Minimal types for a FluxBot-style API.
 * This SDK is intentionally "dummy" (pre-launch), but the shape matches the direction.
 */
declare const HealthSchema: z.ZodObject<{
    ok: z.ZodDefault<z.ZodBoolean>;
    version: z.ZodOptional<z.ZodString>;
    uptimeSec: z.ZodOptional<z.ZodNumber>;
    rpc: z.ZodOptional<z.ZodObject<{
        ok: z.ZodOptional<z.ZodBoolean>;
        ms: z.ZodOptional<z.ZodNumber>;
        url: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    wss: z.ZodOptional<z.ZodObject<{
        ok: z.ZodOptional<z.ZodBoolean>;
        lastLogAtMs: z.ZodOptional<z.ZodNumber>;
        subscribed: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type Health = z.infer<typeof HealthSchema>;
declare const BotModeSchema: z.ZodEnum<{
    paper: "paper";
    live: "live";
}>;
type BotMode = z.infer<typeof BotModeSchema>;
declare const StartStopResponseSchema: z.ZodObject<{
    ok: z.ZodBoolean;
    started: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
type StartStopResponse = z.infer<typeof StartStopResponseSchema>;
declare const EventTypeSchema: z.ZodEnum<{
    candidate: "candidate";
    gate_skip: "gate_skip";
    entry_skip: "entry_skip";
    enter_attempt: "enter_attempt";
    enter_ok: "enter_ok";
    enter_fail: "enter_fail";
    exit_attempt: "exit_attempt";
    exit_retry: "exit_retry";
    exit_ok: "exit_ok";
    exit_fail: "exit_fail";
    fast_exit: "fast_exit";
    rug_risk: "rug_risk";
    rug_confirm: "rug_confirm";
    rpc_down: "rpc_down";
}>;
declare const BotEventSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    ts: z.ZodNumber;
    type: z.ZodEnum<{
        candidate: "candidate";
        gate_skip: "gate_skip";
        entry_skip: "entry_skip";
        enter_attempt: "enter_attempt";
        enter_ok: "enter_ok";
        enter_fail: "enter_fail";
        exit_attempt: "exit_attempt";
        exit_retry: "exit_retry";
        exit_ok: "exit_ok";
        exit_fail: "exit_fail";
        fast_exit: "fast_exit";
        rug_risk: "rug_risk";
        rug_confirm: "rug_confirm";
        rpc_down: "rpc_down";
    }>;
    mint: z.ZodOptional<z.ZodString>;
    signature: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
type BotEvent = z.infer<typeof BotEventSchema>;
declare const EventsResponseSchema: z.ZodObject<{
    ok: z.ZodDefault<z.ZodBoolean>;
    events: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        ts: z.ZodNumber;
        type: z.ZodEnum<{
            candidate: "candidate";
            gate_skip: "gate_skip";
            entry_skip: "entry_skip";
            enter_attempt: "enter_attempt";
            enter_ok: "enter_ok";
            enter_fail: "enter_fail";
            exit_attempt: "exit_attempt";
            exit_retry: "exit_retry";
            exit_ok: "exit_ok";
            exit_fail: "exit_fail";
            fast_exit: "fast_exit";
            rug_risk: "rug_risk";
            rug_confirm: "rug_confirm";
            rpc_down: "rpc_down";
        }>;
        mint: z.ZodOptional<z.ZodString>;
        signature: z.ZodOptional<z.ZodString>;
        message: z.ZodOptional<z.ZodString>;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type EventsResponse = z.infer<typeof EventsResponseSchema>;
type FluxBotClientOptions = {
    baseUrl: string;
    apiKey?: string;
    timeoutMs?: number;
};

declare class FluxBotClient {
    readonly baseUrl: string;
    readonly apiKey?: string;
    readonly timeoutMs: number;
    constructor(opts: FluxBotClientOptions);
    private headers;
    health(): Promise<Health>;
    start(): Promise<StartStopResponse>;
    stop(): Promise<StartStopResponse>;
    panicClose(): Promise<StartStopResponse>;
    events(limit?: number): Promise<EventsResponse>;
    /** Convenience: stream events by polling. */
    pollEvents(params?: {
        intervalMs?: number;
        limit?: number;
        stopSignal?: AbortSignal;
    }): AsyncGenerator<{
        ts: number;
        type: "candidate" | "gate_skip" | "entry_skip" | "enter_attempt" | "enter_ok" | "enter_fail" | "exit_attempt" | "exit_retry" | "exit_ok" | "exit_fail" | "fast_exit" | "rug_risk" | "rug_confirm" | "rpc_down";
        id?: string | undefined;
        mint?: string | undefined;
        signature?: string | undefined;
        message?: string | undefined;
        data?: Record<string, any> | undefined;
    }, void, unknown>;
}

declare class FluxBotError extends Error {
    readonly info?: unknown | undefined;
    constructor(message: string, info?: unknown | undefined);
}
declare class FluxBotHttpError extends FluxBotError {
    readonly status: number;
    readonly url: string;
    readonly bodyText?: string | undefined;
    constructor(message: string, status: number, url: string, bodyText?: string | undefined);
}

export { type BotEvent, BotEventSchema, type BotMode, BotModeSchema, EventTypeSchema, type EventsResponse, EventsResponseSchema, FluxBotClient, type FluxBotClientOptions, FluxBotError, FluxBotHttpError, type Health, HealthSchema, type StartStopResponse, StartStopResponseSchema };

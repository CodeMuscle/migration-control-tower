/**
 * Correlation id helpers. Fastify assigns `request.id`; we prefer an inbound
 * `x-request-id` when present so ids survive across services. Used by the
 * success interceptor, the exception filter (envelope `meta.requestId`) and
 * the pino logger.
 */
import { randomUUID } from "node:crypto";

export function genRequestId(headerValue?: string | string[]): string {
  if (typeof headerValue === "string" && headerValue.trim()) {
    return headerValue.trim();
  }
  return randomUUID();
}

export function requestIdOf(req: unknown): string {
  const r = req as { id?: unknown };
  return typeof r?.id === "string" && r.id ? r.id : randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Async job descriptor. Every background unit of work is a BullMQ job that
 * carries a tenant id and an idempotency key so retries are safe.
 * See CLAUDE.md → Coding conventions.
 */
export interface JobEnvelope<TPayload> {
  /** Stable key; re-enqueuing with the same key must not double-process. */
  idempotencyKey: string;
  tenantId: string;
  /** Correlation id, propagated from the originating API request when any. */
  requestId: string;
  payload: TPayload;
  enqueuedAt: string;
}

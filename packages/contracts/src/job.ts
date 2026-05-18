/**
 * Async job descriptor. Every background unit of work is a BullMQ job that
 * carries a tenant id and an idempotency key so retries are safe.
 * See CLAUDE.md → Coding conventions §4.
 */
import { z } from "zod";

/** Runtime schema for the job envelope (payload validated per-queue). */
export const jobEnvelopeSchema = <T extends z.ZodTypeAny>(payload: T) =>
  z.object({
    /** Stable key; re-enqueuing with the same key must not double-process. */
    idempotencyKey: z.string().min(1),
    tenantId: z.string().uuid(),
    /** Correlation id, propagated from the originating API request when any. */
    requestId: z.string(),
    payload,
    enqueuedAt: z.string().datetime({ offset: true }),
  });

export interface JobEnvelope<TPayload> {
  idempotencyKey: string;
  tenantId: string;
  requestId: string;
  payload: TPayload;
  enqueuedAt: string;
}

/**
 * Validation worker handoff contract (blueprint → "Validation-ready handoff
 * contract"): the stable, immutable inputs a validation run needs.
 */
export const ValidationHandoffSchema = z.object({
  tenantId: z.string().uuid(),
  projectId: z.string().uuid(),
  batchId: z.string().uuid(),
  sourceSnapshotId: z.string().uuid(),
  destinationSchemaId: z.string().uuid(),
  mappingVersionId: z.string().uuid(),
  triggeredBy: z.string().uuid(),
});
export type ValidationHandoff = z.infer<typeof ValidationHandoffSchema>;

/**
 * BullMQ job payload schemas. These are the **exact** wire formats producers
 * (API) and consumers (workers) agree on — the source of truth for both.
 * Pull the type via `z.infer` on either side so a producer/consumer drift
 * shows up as a TypeScript error.
 */
import { z } from "zod";

import { SourceTypeSchema } from "./enums.js";

export const UPLOAD_PROCESSING_QUEUE = "upload-processing" as const;
export const VALIDATION_QUEUE = "validation" as const;

/**
 * `validation` job (blueprint Module 6 → "Validation-ready handoff contract"
 * + a server-issued `runId` so the worker can update the right
 * `validation_runs` row).
 */
export const ValidationJobSchema = z.object({
  runId: z.string().uuid(),
  tenantId: z.string().uuid(),
  projectId: z.string().uuid(),
  batchId: z.string().uuid(),
  sourceSnapshotId: z.string().uuid(),
  destinationSchemaId: z.string().uuid(),
  mappingVersionId: z.string().uuid(),
  triggeredBy: z.string().uuid(),
});
export type ValidationJob = z.infer<typeof ValidationJobSchema>;

export const ValidationResultSchema = z.object({
  runId: z.string().uuid(),
  rowsScanned: z.number().int().nonnegative(),
  errorCount: z.number().int().nonnegative(),
  warningCount: z.number().int().nonnegative(),
  infoCount: z.number().int().nonnegative(),
});
export type ValidationResult = z.infer<typeof ValidationResultSchema>;

/**
 * `upload-processing` job (blueprint Module 4 → "Queue contracts"). Field
 * order and names are verbatim from the blueprint.
 */
export const UploadProcessingJobSchema = z.object({
  tenantId: z.string().uuid(),
  projectId: z.string().uuid(),
  batchId: z.string().uuid(),
  uploadId: z.string().uuid(),
  objectKey: z.string(),
  sourceType: SourceTypeSchema,
});
export type UploadProcessingJob = z.infer<typeof UploadProcessingJobSchema>;

/**
 * `upload-processing` completion payload — returned from the worker, surfaced
 * by BullMQ's `completed` event. The API bridge uses `snapshotId` to emit
 * `schema.source_snapshot.created` onto SSE.
 */
export const UploadProcessingResultSchema = z.object({
  snapshotId: z.string().uuid(),
  rowCount: z.number().int().nonnegative(),
});
export type UploadProcessingResult = z.infer<typeof UploadProcessingResultSchema>;

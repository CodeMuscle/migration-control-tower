/** Module 4 — Source Ingestion DTOs (blueprint → "Module 4"). */
import { z } from "zod";

import { SourceTypeSchema, DataSourceStatusSchema, BatchStatusSchema } from "../enums.js";

/** POST /v1/projects/:projectId/uploads/presign */
export const PresignUploadRequestSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  sourceType: SourceTypeSchema,
});
export type PresignUploadRequest = z.infer<typeof PresignUploadRequestSchema>;

export const PresignUploadResponseSchema = z.object({
  uploadId: z.string().uuid(),
  objectKey: z.string(),
  uploadUrl: z.string().url(),
  expiresInSeconds: z.number().int().positive(),
});
export type PresignUploadResponse = z.infer<typeof PresignUploadResponseSchema>;

/** POST /v1/projects/:projectId/uploads/complete (Idempotency-Key required) */
export const CompleteUploadRequestSchema = z.object({
  uploadId: z.string().uuid(),
  checksumSha256: z.string().min(1),
});
export type CompleteUploadRequest = z.infer<typeof CompleteUploadRequestSchema>;

/** GET /v1/projects/:projectId/sources */
export const DataSourceSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  sourceType: SourceTypeSchema,
  status: DataSourceStatusSchema,
  latestBatchStatus: BatchStatusSchema.nullable(),
});
export const ListSourcesResponseSchema = z.object({
  sources: z.array(DataSourceSummarySchema),
});
export type ListSourcesResponse = z.infer<typeof ListSourcesResponseSchema>;

/** GET /v1/source-batches/:batchId */
export const SourceBatchSchema = z.object({
  id: z.string().uuid(),
  status: BatchStatusSchema,
  rowCount: z.number().int().nullable(),
  startedAt: z.string().datetime({ offset: true }).nullable(),
  finishedAt: z.string().datetime({ offset: true }).nullable(),
  sourceSnapshotId: z.string().uuid().nullable(),
});
export type SourceBatch = z.infer<typeof SourceBatchSchema>;

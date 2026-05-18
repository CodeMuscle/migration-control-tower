/** Module 5 — Schema Registry DTOs (blueprint → "Module 5"). */
import { z } from "zod";

import {
  DetectedFormatSchema,
  FieldDataTypeSchema,
  DestinationSchemaStatusSchema,
} from "../enums.js";

/** GET /v1/projects/:projectId/source-schema (example response shape). */
export const SourceSchemaColumnSchema = z.object({
  fieldKey: z.string(),
  displayName: z.string(),
  dataType: FieldDataTypeSchema,
  sampleValues: z.array(z.string()).optional(),
  nullable: z.boolean(),
});

export const SourceSchemaSnapshotResponseSchema = z.object({
  snapshotId: z.string().uuid(),
  version: z.number().int(),
  detectedFormat: DetectedFormatSchema,
  columns: z.array(SourceSchemaColumnSchema),
});
export type SourceSchemaSnapshotResponse = z.infer<typeof SourceSchemaSnapshotResponseSchema>;

/** GET /v1/destination-schemas/:productType/active */
export const DestinationSchemaResponseSchema = z.object({
  id: z.string().uuid(),
  productType: z.string(),
  version: z.string(),
  status: DestinationSchemaStatusSchema,
  schemaJson: z.record(z.unknown()),
});
export type DestinationSchemaResponse = z.infer<typeof DestinationSchemaResponseSchema>;

/** POST /v1/projects/:projectId/source-schema/refresh — no body. */
export const RefreshSourceSchemaResponseSchema = z.object({
  snapshotId: z.string().uuid(),
  version: z.number().int(),
});
export type RefreshSourceSchemaResponse = z.infer<typeof RefreshSourceSchemaResponseSchema>;

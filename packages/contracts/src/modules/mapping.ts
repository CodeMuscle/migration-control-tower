/** Module 6 — Mapping DTOs (blueprint → "Module 6"). */
import { z } from "zod";

import { MappingTypeSchema, MappingVersionStatusSchema } from "../enums.js";

/** One mapping row in a PUT /mappings bulk upsert. */
export const MappingInputSchema = z.object({
  sourceFieldKey: z.string().optional(),
  destinationFieldKey: z.string(),
  mappingType: MappingTypeSchema,
  transformRuleId: z.string().uuid().optional(),
  defaultValue: z.unknown().optional(),
  config: z.record(z.unknown()).optional(),
  isRequiredOverride: z.boolean().optional(),
});
export type MappingInput = z.infer<typeof MappingInputSchema>;

/** PUT /v1/projects/:projectId/mappings */
export const UpsertMappingsRequestSchema = z.object({
  sourceSnapshotId: z.string().uuid(),
  destinationSchemaId: z.string().uuid(),
  mappings: z.array(MappingInputSchema),
});
export type UpsertMappingsRequest = z.infer<typeof UpsertMappingsRequestSchema>;

/** POST /v1/projects/:projectId/mappings/publish (Idempotency-Key required) */
export const PublishMappingRequestSchema = z.object({
  notes: z.string().optional(),
});
export type PublishMappingRequest = z.infer<typeof PublishMappingRequestSchema>;

export const PublishMappingResponseSchema = z.object({
  mappingVersionId: z.string().uuid(),
  versionNumber: z.number().int().positive(),
  status: MappingVersionStatusSchema,
});
export type PublishMappingResponse = z.infer<typeof PublishMappingResponseSchema>;

/** GET /v1/projects/:projectId/mappings/diff?from=&to= */
export const MappingDiffQuerySchema = z.object({
  from: z.coerce.number().int().positive(),
  to: z.coerce.number().int().positive(),
});
export type MappingDiffQuery = z.infer<typeof MappingDiffQuerySchema>;

export const MappingDiffResponseSchema = z.object({
  added: z.array(MappingInputSchema),
  changed: z.array(MappingInputSchema),
  removed: z.array(MappingInputSchema),
});
export type MappingDiffResponse = z.infer<typeof MappingDiffResponseSchema>;

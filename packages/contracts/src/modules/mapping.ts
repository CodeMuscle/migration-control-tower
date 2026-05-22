/** Module 6 — Mapping DTOs (blueprint → "Module 6"). */
import { z } from "zod";

import { MappingTypeSchema, MappingVersionStatusSchema } from "../enums.js";

/** Built-in transform rule keys; lazily seeded per tenant. */
export const BUILTIN_TRANSFORM_RULE_KEYS = [
  "trim",
  "uppercase",
  "lowercase",
  "concat",
  "date_parse",
  "phone_normalize",
] as const;
export type BuiltinTransformRuleKey = (typeof BUILTIN_TRANSFORM_RULE_KEYS)[number];

/** Per-rule config schemas — what each rule expects in its JSONB config. */
export const TransformRuleConfigSchemas = {
  trim: z.object({}).strict(),
  uppercase: z.object({}).strict(),
  lowercase: z.object({}).strict(),
  concat: z.object({ separator: z.string().default(" ") }).strict(),
  date_parse: z.object({ format: z.string() }).strict(),
  phone_normalize: z.object({ defaultCountry: z.string().length(2).optional() }).strict(),
} as const;

export const TransformRuleSchema = z.object({
  id: z.string().uuid(),
  ruleKey: z.enum(BUILTIN_TRANSFORM_RULE_KEYS),
  displayName: z.string(),
  config: z.record(z.unknown()),
});
export type TransformRule = z.infer<typeof TransformRuleSchema>;

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

/** A draft row as returned by GET /mappings — includes server-managed fields. */
export const MappingDraftSchema = MappingInputSchema.extend({
  id: z.string().uuid(),
  updatedAt: z.string().datetime({ offset: true }),
});
export type MappingDraft = z.infer<typeof MappingDraftSchema>;

export const DestinationFieldRefSchema = z.object({
  fieldKey: z.string(),
  displayName: z.string().optional(),
  isRequired: z.boolean().optional(),
});

export const MappingTemplateRefSchema = z.object({
  id: z.string().uuid(),
  templateName: z.string(),
  sourceSystemName: z.string(),
  targetProductType: z.string(),
});

/** GET /v1/projects/:projectId/mappings */
export const GetMappingsResponseSchema = z.object({
  sourceSnapshotId: z.string().uuid().nullable(),
  destinationSchemaId: z.string().uuid().nullable(),
  drafts: z.array(MappingDraftSchema),
  unresolvedDestinationFields: z.array(DestinationFieldRefSchema),
  templateSuggestions: z.array(MappingTemplateRefSchema),
  transformRules: z.array(TransformRuleSchema),
});
export type GetMappingsResponse = z.infer<typeof GetMappingsResponseSchema>;

/** PUT /v1/projects/:projectId/mappings */
export const UpsertMappingsRequestSchema = z.object({
  sourceSnapshotId: z.string().uuid(),
  destinationSchemaId: z.string().uuid(),
  mappings: z.array(MappingInputSchema),
});
export type UpsertMappingsRequest = z.infer<typeof UpsertMappingsRequestSchema>;

export const UpsertMappingsResponseSchema = z.object({
  draftCount: z.number().int().nonnegative(),
  draftUpdatedAt: z.string().datetime({ offset: true }),
});
export type UpsertMappingsResponse = z.infer<typeof UpsertMappingsResponseSchema>;

/** POST /v1/projects/:projectId/mappings/publish — body; If-Match header carries the draft updated_at. */
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

/** GET /v1/projects/:projectId/mappings/versions — cursor paginated. */
export const ListMappingVersionsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
});
export type ListMappingVersionsQuery = z.infer<typeof ListMappingVersionsQuerySchema>;

export const MappingVersionSummarySchema = z.object({
  id: z.string().uuid(),
  versionNumber: z.number().int().positive(),
  status: MappingVersionStatusSchema,
  publishedBy: z.string().uuid(),
  publishedAt: z.string().datetime({ offset: true }),
  notes: z.string().nullable(),
});
export type MappingVersionSummary = z.infer<typeof MappingVersionSummarySchema>;

export const ListMappingVersionsResponseSchema = z.object({
  items: z.array(MappingVersionSummarySchema),
  nextCursor: z.string().nullable(),
});
export type ListMappingVersionsResponse = z.infer<typeof ListMappingVersionsResponseSchema>;

/** GET /v1/projects/:projectId/mappings/diff?from=&to= */
export const MappingDiffQuerySchema = z.object({
  from: z.coerce.number().int().positive(),
  to: z.coerce.number().int().positive(),
});
export type MappingDiffQuery = z.infer<typeof MappingDiffQuerySchema>;

export const MappingDiffEntrySchema = z.object({
  destinationFieldKey: z.string(),
  from: MappingInputSchema.optional(),
  to: MappingInputSchema.optional(),
});
export type MappingDiffEntry = z.infer<typeof MappingDiffEntrySchema>;

export const MappingDiffResponseSchema = z.object({
  fromVersion: z.number().int().positive(),
  toVersion: z.number().int().positive(),
  added: z.array(MappingDiffEntrySchema),
  changed: z.array(MappingDiffEntrySchema),
  removed: z.array(MappingDiffEntrySchema),
});
export type MappingDiffResponse = z.infer<typeof MappingDiffResponseSchema>;

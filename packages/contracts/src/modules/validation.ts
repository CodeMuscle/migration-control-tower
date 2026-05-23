/** Module 7 — Validation DTOs (LLD §7). */
import { z } from "zod";

import {
  IssueSeveritySchema,
  IssueStatusSchema,
  ValidationRuleKeySchema,
  ValidationRunStatusSchema,
} from "../enums.js";

/** POST /v1/migration-projects/:projectId/validate */
export const CreateValidationRunRequestSchema = z.object({
  batchId: z.string().uuid(),
  mappingVersionId: z.string().uuid(),
});
export type CreateValidationRunRequest = z.infer<typeof CreateValidationRunRequestSchema>;

export const CreateValidationRunResponseSchema = z.object({
  runId: z.string().uuid(),
  status: ValidationRunStatusSchema,
});
export type CreateValidationRunResponse = z.infer<typeof CreateValidationRunResponseSchema>;

export const ValidationRunSchema = z.object({
  id: z.string().uuid(),
  status: ValidationRunStatusSchema,
  rowsScanned: z.number().int().nonnegative(),
  errorCount: z.number().int().nonnegative(),
  warningCount: z.number().int().nonnegative(),
  infoCount: z.number().int().nonnegative(),
  errorMessage: z.string().nullable(),
  startedAt: z.string().datetime({ offset: true }).nullable(),
  finishedAt: z.string().datetime({ offset: true }).nullable(),
  createdAt: z.string().datetime({ offset: true }),
});
export type ValidationRun = z.infer<typeof ValidationRunSchema>;

/** GET /v1/validation-runs/:runId/summary — grouped by (destinationFieldKey, ruleKey). */
export const ValidationIssueSampleSchema = z.object({
  issueId: z.string().uuid(),
  rowIndex: z.number().int().nonnegative(),
  sampleValue: z.string().nullable(),
  message: z.string(),
});

export const ValidationRunSummaryGroupSchema = z.object({
  destinationFieldKey: z.string(),
  ruleKey: ValidationRuleKeySchema,
  severity: IssueSeveritySchema,
  count: z.number().int().nonnegative(),
  samples: z.array(ValidationIssueSampleSchema),
});

export const ValidationRunSummaryResponseSchema = z.object({
  run: ValidationRunSchema,
  groups: z.array(ValidationRunSummaryGroupSchema),
});
export type ValidationRunSummaryResponse = z.infer<typeof ValidationRunSummaryResponseSchema>;

/** GET /v1/migration-projects/:projectId/issues — cursor paginated. */
export const ListIssuesQuerySchema = z.object({
  status: IssueStatusSchema.optional(),
  severity: IssueSeveritySchema.optional(),
  destinationFieldKey: z.string().optional(),
  runId: z.string().uuid().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
});
export type ListIssuesQuery = z.infer<typeof ListIssuesQuerySchema>;

export const ValidationIssueSchema = z.object({
  id: z.string().uuid(),
  runId: z.string().uuid(),
  severity: IssueSeveritySchema,
  ruleKey: ValidationRuleKeySchema,
  rowIndex: z.number().int().nonnegative(),
  sourceFieldKey: z.string().nullable(),
  destinationFieldKey: z.string(),
  message: z.string(),
  sampleValue: z.string().nullable(),
  status: IssueStatusSchema,
  resolutionNote: z.string().nullable(),
  resolvedAt: z.string().datetime({ offset: true }).nullable(),
  resolvedBy: z.string().uuid().nullable(),
  createdAt: z.string().datetime({ offset: true }),
});
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

export const ListIssuesResponseSchema = z.object({
  items: z.array(ValidationIssueSchema),
  nextCursor: z.string().nullable(),
});
export type ListIssuesResponse = z.infer<typeof ListIssuesResponseSchema>;

/** PATCH /v1/issues/:id */
export const PatchIssueRequestSchema = z.object({
  status: z.enum(["resolved", "ignored"]),
  resolutionNote: z.string().optional(),
});
export type PatchIssueRequest = z.infer<typeof PatchIssueRequestSchema>;

/** POST /v1/issues/bulk-resolve */
export const BulkResolveRequestSchema = z.object({
  filter: z.object({
    projectId: z.string().uuid(),
    runId: z.string().uuid().optional(),
    destinationFieldKey: z.string().optional(),
    ruleKey: ValidationRuleKeySchema.optional(),
    severity: IssueSeveritySchema.optional(),
  }),
  status: z.enum(["resolved", "ignored"]).default("resolved"),
  resolutionNote: z.string().optional(),
});
export type BulkResolveRequest = z.infer<typeof BulkResolveRequestSchema>;

export const BulkResolveResponseSchema = z.object({
  updated: z.number().int().nonnegative(),
});
export type BulkResolveResponse = z.infer<typeof BulkResolveResponseSchema>;

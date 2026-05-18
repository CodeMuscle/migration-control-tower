/** Module 3 — Migration Projects DTOs (blueprint → "Module 3"). */
import { z } from "zod";

import {
  ProjectStatusSchema,
  ProjectStageSchema,
  MigrationTypeSchema,
  TargetEnvironmentSchema,
  BatchStatusSchema,
  AccessLevelSchema,
} from "../enums.js";

/** POST /v1/migration-projects */
export const CreateProjectRequestSchema = z.object({
  name: z.string().min(1).max(150),
  customerName: z.string().min(1).max(150),
  projectCode: z.string().min(1).max(50),
  migrationType: MigrationTypeSchema,
  targetProductType: z.string().max(50),
  targetEnvironment: TargetEnvironmentSchema,
  ownerUserId: z.string().uuid(),
});
export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;

/**
 * GET /v1/migration-projects — filters + cursor pagination.
 * `cursor` is an opaque token (createdAt|id) returned as `nextCursor`.
 */
export const ListProjectsQuerySchema = z.object({
  status: ProjectStatusSchema.optional(),
  stage: ProjectStageSchema.optional(),
  ownerUserId: z.string().uuid().optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
});
export type ListProjectsQuery = z.infer<typeof ListProjectsQuerySchema>;

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  customerName: z.string(),
  projectCode: z.string(),
  status: ProjectStatusSchema,
  currentStage: ProjectStageSchema,
  migrationType: MigrationTypeSchema,
  targetEnvironment: TargetEnvironmentSchema,
  targetProductType: z.string(),
  ownerUserId: z.string().uuid(),
  dueAt: z.string().datetime({ offset: true }).nullable(),
  wentLiveAt: z.string().datetime({ offset: true }).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ListProjectsResponseSchema = z.object({
  items: z.array(ProjectSchema),
  nextCursor: z.string().nullable(),
});
export type ListProjectsResponse = z.infer<typeof ListProjectsResponseSchema>;

export const ProjectActivitySchema = z.object({
  id: z.string().uuid(),
  activityType: z.string(),
  actorUserId: z.string().uuid().nullable(),
  payload: z.unknown(),
  createdAt: z.string().datetime({ offset: true }),
});
export type ProjectActivity = z.infer<typeof ProjectActivitySchema>;

export const ProjectSummarySchema = z.object({
  /** Open validation issues (Module 8). 0 until Issue Management lands. */
  openIssuesCount: z.number().int().nonnegative(),
  /** Status of the most recent source batch, if any. */
  lastBatchStatus: BatchStatusSchema.nullable(),
});
export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;

/** GET /v1/migration-projects/:projectId */
export const ProjectDetailResponseSchema = z.object({
  project: ProjectSchema,
  recentActivity: z.array(ProjectActivitySchema),
  summary: ProjectSummarySchema,
});
export type ProjectDetailResponse = z.infer<typeof ProjectDetailResponseSchema>;

/** GET /v1/migration-projects/:projectId/activity — cursor paginated. */
export const ListActivityQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
});
export type ListActivityQuery = z.infer<typeof ListActivityQuerySchema>;

export const ListActivityResponseSchema = z.object({
  items: z.array(ProjectActivitySchema),
  nextCursor: z.string().nullable(),
});
export type ListActivityResponse = z.infer<typeof ListActivityResponseSchema>;

/**
 * POST /v1/migration-projects/:projectId/advance-stage.
 * `toStage` is the next stage in the lifecycle, or the literal "blocked"
 * (side-branch from any stage — sets status=blocked, stage unchanged). The
 * server enforces the state machine; this only constrains the input space.
 */
export const AdvanceStageTargetSchema = z.union([ProjectStageSchema, z.literal("blocked")]);
export type AdvanceStageTarget = z.infer<typeof AdvanceStageTargetSchema>;

export const AdvanceStageRequestSchema = z.object({
  toStage: AdvanceStageTargetSchema,
  reason: z.string().optional(),
});
export type AdvanceStageRequest = z.infer<typeof AdvanceStageRequestSchema>;

export const AdvanceStageResponseSchema = z.object({
  status: ProjectStatusSchema,
  currentStage: ProjectStageSchema,
});
export type AdvanceStageResponse = z.infer<typeof AdvanceStageResponseSchema>;

/** POST /v1/migration-projects/:projectId/members */
export const AddProjectMemberRequestSchema = z.object({
  userId: z.string().uuid(),
  accessLevel: AccessLevelSchema,
});
export type AddProjectMemberRequest = z.infer<typeof AddProjectMemberRequestSchema>;

export const ProjectMemberSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  accessLevel: AccessLevelSchema,
  createdAt: z.string().datetime({ offset: true }),
});
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;

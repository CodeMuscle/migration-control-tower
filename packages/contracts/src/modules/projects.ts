/** Module 3 — Migration Projects DTOs (blueprint → "Module 3"). */
import { z } from "zod";

import {
  ProjectStatusSchema,
  ProjectStageSchema,
  MigrationTypeSchema,
  TargetEnvironmentSchema,
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

/** GET /v1/migration-projects — query filters. */
export const ListProjectsQuerySchema = z.object({
  status: ProjectStatusSchema.optional(),
  stage: ProjectStageSchema.optional(),
  ownerUserId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(25),
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

/** POST /v1/migration-projects/:projectId/advance-stage */
export const AdvanceStageRequestSchema = z.object({
  toStage: ProjectStageSchema,
  reason: z.string().optional(),
});
export type AdvanceStageRequest = z.infer<typeof AdvanceStageRequestSchema>;

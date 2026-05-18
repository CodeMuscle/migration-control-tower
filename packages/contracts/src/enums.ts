/**
 * Enum-like value sets from /docs/design/database-blueprint.docx (Modules 1–6).
 * These mirror the DB CHECK constraints in packages/db's initial migration —
 * keep the two in sync. API payloads use these snake_case string values.
 */
import { z } from "zod";

export const RoleSchema = z.enum([
  "owner",
  "admin",
  "manager",
  "engineer",
  "customer_viewer",
  "customer_editor",
]);
export type Role = z.infer<typeof RoleSchema>;

export const UserStatusSchema = z.enum(["active", "invited", "disabled"]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const MembershipStatusSchema = z.enum(["active", "invited", "revoked"]);
export type MembershipStatus = z.infer<typeof MembershipStatusSchema>;

export const TenantPlanSchema = z.enum(["free", "growth", "enterprise"]);
export type TenantPlan = z.infer<typeof TenantPlanSchema>;

export const TenantStatusSchema = z.enum(["active", "suspended", "trialing"]);
export type TenantStatus = z.infer<typeof TenantStatusSchema>;

export const ProjectStatusSchema = z.enum([
  "draft",
  "active",
  "blocked",
  "ready_for_cutover",
  "completed",
  "rolled_back",
]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectStageSchema = z.enum([
  "setup",
  "ingestion",
  "mapping",
  "validation",
  "dry_run",
  "cutover",
  "complete",
]);
export type ProjectStage = z.infer<typeof ProjectStageSchema>;

export const MigrationTypeSchema = z.enum(["file", "api", "hybrid"]);
export type MigrationType = z.infer<typeof MigrationTypeSchema>;

export const TargetEnvironmentSchema = z.enum(["sandbox", "production"]);
export type TargetEnvironment = z.infer<typeof TargetEnvironmentSchema>;

export const AccessLevelSchema = z.enum(["owner", "editor", "viewer"]);
export type AccessLevel = z.infer<typeof AccessLevelSchema>;

export const SourceTypeSchema = z.enum(["csv", "xlsx", "api", "s3", "manual"]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const DataSourceStatusSchema = z.enum([
  "connected",
  "uploaded",
  "processing",
  "ready",
  "failed",
]);
export type DataSourceStatus = z.infer<typeof DataSourceStatusSchema>;

export const UploadStatusSchema = z.enum([
  "pending",
  "uploaded",
  "processing",
  "processed",
  "failed",
]);
export type UploadStatus = z.infer<typeof UploadStatusSchema>;

export const BatchTypeSchema = z.enum(["initial", "retry", "delta"]);
export type BatchType = z.infer<typeof BatchTypeSchema>;

export const BatchStatusSchema = z.enum([
  "queued",
  "parsing",
  "parsed",
  "validation_pending",
  "failed",
]);
export type BatchStatus = z.infer<typeof BatchStatusSchema>;

export const DetectedFormatSchema = z.enum(["csv", "xlsx", "json"]);
export type DetectedFormat = z.infer<typeof DetectedFormatSchema>;

export const FieldDataTypeSchema = z.enum(["string", "number", "date", "enum", "boolean"]);
export type FieldDataType = z.infer<typeof FieldDataTypeSchema>;

export const DestinationSchemaStatusSchema = z.enum(["active", "deprecated"]);
export type DestinationSchemaStatus = z.infer<typeof DestinationSchemaStatusSchema>;

export const MappingTypeSchema = z.enum([
  "direct",
  "constant",
  "transform",
  "composite",
  "ignored",
]);
export type MappingType = z.infer<typeof MappingTypeSchema>;

export const FieldMappingStatusSchema = z.enum(["draft", "active"]);
export type FieldMappingStatus = z.infer<typeof FieldMappingStatusSchema>;

export const MappingVersionStatusSchema = z.enum(["published", "deprecated"]);
export type MappingVersionStatus = z.infer<typeof MappingVersionStatusSchema>;

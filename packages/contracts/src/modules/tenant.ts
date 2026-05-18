/** Module 2 — Tenant DTOs (blueprint → "Module 2 — Tenant / APIs"). */
import { z } from "zod";

import { TenantPlanSchema, TenantStatusSchema } from "../enums.js";

/** GET /v1/tenant */
export const GetTenantResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  plan: TenantPlanSchema,
  status: TenantStatusSchema,
  primaryRegion: z.string(),
});
export type GetTenantResponse = z.infer<typeof GetTenantResponseSchema>;

/** PATCH /v1/tenant/settings — all fields optional (partial update). */
export const UpdateTenantSettingsRequestSchema = z
  .object({
    defaultTimezone: z.string(),
    dataRetentionDays: z.number().int().positive(),
    defaultProductType: z.string(),
    allowCustomerComments: z.boolean(),
    piiMaskingEnabled: z.boolean(),
  })
  .partial();
export type UpdateTenantSettingsRequest = z.infer<typeof UpdateTenantSettingsRequestSchema>;

/** GET /v1/tenant/features */
export const FeatureEntitlementSchema = z.object({
  featureKey: z.string(),
  enabled: z.boolean(),
  config: z.record(z.unknown()).nullable().optional(),
});
export const GetTenantFeaturesResponseSchema = z.object({
  features: z.array(FeatureEntitlementSchema),
});
export type GetTenantFeaturesResponse = z.infer<typeof GetTenantFeaturesResponseSchema>;

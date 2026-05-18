/** Module 1 — Identity DTOs (blueprint → "Module 1 — Identity / APIs"). */
import { z } from "zod";

import { RoleSchema, MembershipStatusSchema } from "../enums.js";

/** POST /v1/auth/invitations */
export const CreateInvitationRequestSchema = z.object({
  email: z.string().email(),
  role: RoleSchema,
});
export type CreateInvitationRequest = z.infer<typeof CreateInvitationRequestSchema>;

export const CreateInvitationResponseSchema = z.object({
  invitationId: z.string().uuid(),
  status: MembershipStatusSchema,
});
export type CreateInvitationResponse = z.infer<typeof CreateInvitationResponseSchema>;

/** POST /v1/auth/invitations/accept */
export const AcceptInvitationRequestSchema = z.object({
  token: z.string().min(1),
});
export type AcceptInvitationRequest = z.infer<typeof AcceptInvitationRequestSchema>;

export const AcceptInvitationResponseSchema = z.object({
  membershipId: z.string().uuid(),
  tenantId: z.string().uuid(),
});
export type AcceptInvitationResponse = z.infer<typeof AcceptInvitationResponseSchema>;

/** GET /v1/me */
export const MeResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    fullName: z.string(),
  }),
  tenant: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  roles: z.array(RoleSchema),
});
export type MeResponse = z.infer<typeof MeResponseSchema>;

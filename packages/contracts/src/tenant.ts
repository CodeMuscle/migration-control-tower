/**
 * Tenant context + the request headers it is built from.
 * Source: /docs/design/database-blueprint.docx → "Auth context";
 * CLAUDE.md → Tenant context resolution.
 */
import { z } from "zod";

/**
 * Protected-request headers. The auth guard validates the bearer token, then
 * checks `x-tenant-id` against the user's active memberships before any
 * handler runs. `idempotency-key` is required on mutating workflows
 * (upload-complete, mapping version publish, import creation).
 */
export const AuthHeadersSchema = z.object({
  authorization: z.string().regex(/^Bearer\s.+/, "expected 'Bearer <token>'"),
  "x-tenant-id": z.string().uuid(),
  "idempotency-key": z.string().uuid().optional(),
});
export type AuthHeaders = z.infer<typeof AuthHeadersSchema>;

/**
 * Resolved tenant context, threaded into every data-access call. Built by the
 * auth guard — handlers never parse headers themselves.
 */
export const TenantContextSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  roles: z.array(z.string()),
});
export type TenantContext = z.infer<typeof TenantContextSchema>;

/** Every persisted domain row carries this. Enforced at the repository layer. */
export interface TenantScoped {
  tenant_id: string;
}

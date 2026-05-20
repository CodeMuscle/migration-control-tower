/**
 * Route metadata decorators consumed by the global AuthGuard.
 *   @Public()          — skip auth entirely (health checks, etc.)
 *   @SkipTenantCheck() — require a valid Clerk user, but not tenant
 *                        membership (e.g. accepting an invitation, where the
 *                        membership does not exist yet).
 */
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "auth:isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const SKIP_TENANT_CHECK_KEY = "auth:skipTenantCheck";
export const SkipTenantCheck = () => SetMetadata(SKIP_TENANT_CHECK_KEY, true);

/**
 * Opt a handler out of the success-envelope interceptor — for streaming
 * responses (SSE) where each emission must be the raw event, not
 * `{ data, meta }`.
 */
export const SKIP_ENVELOPE_KEY = "response:skipEnvelope";
export const SkipEnvelope = () => SetMetadata(SKIP_ENVELOPE_KEY, true);

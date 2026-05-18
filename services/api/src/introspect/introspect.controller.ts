/**
 * Debug-only: echoes the TenantContext the AuthGuard resolved for this
 * request. Authenticated like any other /v1 route.
 */
import type { TenantContext } from "@migrationtower/contracts";
import { Controller, Get } from "@nestjs/common";

import { ApiException } from "../common/api-exception.js";
import { CurrentTenant } from "../common/tenant-context.js";

@Controller("v1")
export class IntrospectController {
  @Get("_introspect")
  introspect(@CurrentTenant() ctx: TenantContext | undefined): { tenantContext: TenantContext } {
    if (!ctx) throw ApiException.authRequired();
    return { tenantContext: ctx };
  }
}

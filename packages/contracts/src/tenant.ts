/**
 * Tenant context. Resolved by middleware on every protected endpoint and
 * threaded through to every data-access call (multi-tenant isolation).
 * See CLAUDE.md → Coding conventions.
 */
export interface TenantContext {
  tenantId: string;
  /** Authenticated principal acting within the tenant. */
  userId: string;
  roles: string[];
}

/** Every persisted domain row carries this. Enforced at the repository layer. */
export interface TenantScoped {
  tenant_id: string;
}

/**
 * @migrationtower/db — Prisma client + tenant-scoped access.
 *
 * Two entry points:
 *   - `prisma`               base client; use for global/identity reads
 *                            (users) and migrations/seed only.
 *   - `prismaForTenant(id)`  tenant-bound client that auto-injects
 *                            `tenant_id` into every where/create for
 *                            tenant-owned models. This is the enforcement
 *                            point CLAUDE.md → Coding conventions §1 requires:
 *                            domain code must never hand-write tenant filters.
 */
import { PrismaClient } from "@prisma/client";

export { Prisma, PrismaClient } from "@prisma/client";
export type * from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  __mt_prisma__?: PrismaClient;
};

/** Base client (singleton — dev hot-reload safe). Not tenant-scoped. */
export const prisma: PrismaClient =
  globalForPrisma.__mt_prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__mt_prisma__ = prisma;
}

/**
 * Models that carry `tenant_id` and are filtered by `prismaForTenant`.
 * `User` is intentionally absent — user identities are global; resolve a
 * user's tenants through `Membership`. `Tenant` is scoped by its own `id`.
 *
 * `DestinationSchema` / `MappingTemplate` have a nullable `tenant_id` (global
 * catalog rows): the scoped client only sees the tenant's own rows — read
 * globals via the base `prisma` client.
 */
const TENANT_SCOPED_MODELS = new Set<string>([
  "Tenant",
  "Membership",
  "Invitation",
  "TenantSettings",
  "FeatureEntitlement",
  "MigrationProject",
  "MigrationStageHistory",
  "ProjectMember",
  "ProjectActivity",
  "DataSource",
  "SourceUpload",
  "SourceBatch",
  "DestinationSchema",
  "SourceSchemaSnapshot",
  "SchemaField",
  "FieldMapping",
  "TransformRule",
  "MappingVersion",
  "MappingTemplate",
]);

const WHERE_OPS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "findUnique",
  "findUniqueOrThrow",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
  "count",
  "aggregate",
  "groupBy",
]);

type AnyArgs = Record<string, unknown>;

function scopeWhere(args: AnyArgs, scope: AnyArgs): AnyArgs {
  const where = (args.where as AnyArgs | undefined) ?? {};
  return { ...args, where: { ...where, ...scope } };
}

function injectData(args: AnyArgs, scope: AnyArgs): AnyArgs {
  const data = args.data;
  if (Array.isArray(data)) {
    return {
      ...args,
      data: data.map((row) => ({ ...scope, ...(row as AnyArgs) })),
    };
  }
  return { ...args, data: { ...scope, ...((data as AnyArgs) ?? {}) } };
}

/**
 * Tenant-bound Prisma client. Every query against a tenant-scoped model is
 * constrained to `tenantId`; creates have `tenantId` injected. Re-using one
 * instance per tenant per request is fine — it wraps the shared connection
 * pool of the base client.
 */
export function prismaForTenant(tenantId: string) {
  if (!tenantId) {
    throw new Error("prismaForTenant: tenantId is required");
  }

  return prisma.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        async $allOperations({
          model,
          operation,
          args,
          query,
        }: {
          model: string;
          operation: string;
          args: unknown;
          query: (a: unknown) => Promise<unknown>;
        }) {
          if (model === "User" || !TENANT_SCOPED_MODELS.has(model)) {
            return query(args);
          }

          // The Tenant row itself is identified by its own primary key.
          const scope: AnyArgs = model === "Tenant" ? { id: tenantId } : { tenantId };

          let next: AnyArgs = (args as AnyArgs) ?? {};

          if (WHERE_OPS.has(operation)) {
            next = scopeWhere(next, scope);
          } else if (operation === "create" || operation === "createMany") {
            next = injectData(next, scope);
          } else if (operation === "upsert") {
            next = scopeWhere(next, scope);
            const create = (next.create as AnyArgs | undefined) ?? {};
            next = { ...next, create: { ...scope, ...create } };
          }

          return query(next);
        },
      },
    },
  });
}

/** The tenant-scoped client type, for typing repositories/services. */
export type TenantPrismaClient = ReturnType<typeof prismaForTenant>;

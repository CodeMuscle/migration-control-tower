# CLAUDE.md — Customer Migration Control Tower

Project memory for Claude Code. Read this before working in this repo.

> ⚠️ **Bootstrap provenance.** This monorepo was scaffolded (Module 1) **without**
> the design docs (`/docs/design/lld.*`, `database-blueprint.docx`,
> `tech-stack.csv`) present. The tech stack, 14-module list, and API envelope
> below are derived from the Module 1 brief and marked **(inferred)** where they
> were not explicitly specified. **When the real docs land in `/docs/design/`,
> reconcile this file** — see [`/docs/design/ASSUMPTIONS.md`](docs/design/ASSUMPTIONS.md).

## What this is

An open-source **migration control tower** — the seam between Flatfile and
Rocketlane that B2B SaaS implementation teams have been missing. It runs
customer data migrations end-to-end: ingest source data, register schemas, map
and transform, validate, triage issues, execute the import, cut over, and keep
systems in sync afterward — all multi-tenant.

## Where the design lives

`/docs/design/` is the **single source of truth**. Read the full LLD,
database blueprint, and tech-stack matrix there before implementing a module.
If they conflict with this file, **the docs win** — then update this file.

## Tech stack

Fixed by the brief:

| Layer          | Technology                    |
| -------------- | ----------------------------- |
| Monorepo       | Turborepo + pnpm workspaces   |
| Language       | TypeScript 5.4+               |
| Runtime        | Node 20 LTS                   |
| Async jobs     | BullMQ (Redis-backed)         |
| Database       | PostgreSQL                    |
| Cache / queue  | Redis                         |
| Object storage | S3-compatible (MinIO locally) |
| Mail (local)   | Mailhog                       |

Recommended defaults **(inferred — replace with `tech-stack.csv` verbatim when it
arrives)**: Next.js for `apps/*`, Fastify for `services/api`, Prisma for
`packages/db`, Zod for runtime validation in `packages/contracts`, Vitest for tests.

## Repository layout

```
apps/
  control-plane-web   internal operator console
  customer-portal     customer-facing migration portal
  docs-site           public docs
packages/
  contracts           canonical shared types (API envelope, tenant, jobs) — source of truth
  ui                  shared React design system
  sdk-core            framework-agnostic API client
  sdk-react           React bindings over sdk-core
  db                  database client, schema, migrations
  config/
    tsconfig          shared tsconfig bases
    eslint-config     shared ESLint config
    prettier-config   shared Prettier config
services/
  api                 HTTP API
  worker-validation   BullMQ worker — validation
  worker-import       BullMQ worker — import execution
  worker-sync         BullMQ worker — ongoing sync
infra/docker          local backing services (postgres, redis, minio, mailhog)
docs/design           design docs — READ FIRST
```

npm scope: `@migrationtower/*`.

## Modules (14)

Numbered 1–12 are named in the brief; **13–14 are inferred** cross-cutting
modules (confirm against the LLD).

1. **Identity & Access** — auth, users, sessions, RBAC
2. **Tenant & Organization** — tenant lifecycle, membership, settings
3. **Migration Projects** — project/workspace lifecycle, plan, status
4. **Source Ingestion** — file/API uploads, connectors, staging
5. **Schema Registry** — source/destination schema capture & versioning
6. **Mapping** — field mapping, transforms, derivations
7. **Validation** — rule engine; powered by `worker-validation`
8. **Issue Management** — error triage, assignment, resolution workflow
9. **Import Execution** — batch load/commit; powered by `worker-import`
10. **Cutover** — go-live orchestration, freeze, rollback
11. **SDK** — `sdk-core` + `sdk-react` embedding for customer apps
12. **Sync** — ongoing source↔destination sync; powered by `worker-sync` _(build last)_
13. **Notifications & Webhooks** — email/webhook events _(inferred)_
14. **Audit, Observability & Reporting** — audit log, metrics, reports _(inferred)_

### Suggested implementation order

Identity → Tenant → Migration Projects → Source Ingestion → Schema Registry →
Mapping → Validation → Issue Management → Import Execution → Cutover → SDK →
**Sync (last)**. Cross-cutting modules 13–14 are built incrementally alongside
the others.

## Coding conventions (non-negotiable)

1. **Tenancy.** Every persisted record carries a `tenant_id` column. No
   cross-tenant query is allowed; scoping is enforced at the repository layer.
   Use `TenantScoped` / `TenantContext` from `@migrationtower/contracts`.
2. **API envelope.** Every HTTP endpoint returns the common envelope from
   `database-blueprint.docx` — never a bare resource. Implemented as
   `ApiEnvelope<T>` (`{ data, error, meta }`) in
   `packages/contracts/src/envelope.ts`. **(envelope shape inferred — reconcile
   with the blueprint.)** Use the `ok()` / `fail()` helpers.
3. **Tenant middleware.** Every protected endpoint resolves tenant context via
   middleware before handler logic — handlers never parse tenancy themselves.
4. **Idempotent jobs.** Every async unit of work is a BullMQ job using
   `JobEnvelope<T>` with an `idempotencyKey`. Re-enqueuing the same key must not
   double-process.

## Naming patterns

| Thing                        | Convention           | Example                             |
| ---------------------------- | -------------------- | ----------------------------------- |
| Files / dirs                 | kebab-case           | `source-ingestion.service.ts`       |
| Types / classes / interfaces | PascalCase           | `MigrationProject`, `ApiEnvelope`   |
| DB columns                   | snake_case           | `tenant_id`, `created_at`           |
| API JSON payload fields      | camelCase            | `tenantId`, `createdAt`             |
| Env vars                     | SCREAMING_SNAKE      | `DATABASE_URL`                      |
| Commits                      | Conventional Commits | `feat(validation): add rule engine` |

DB is snake_case, the wire is camelCase — map at the serialization boundary, not
ad hoc.

## Common commands

```bash
pnpm install                 # install workspace
pnpm build                   # turbo build all packages
pnpm dev                     # turbo dev (watch)
pnpm lint                    # eslint across workspace
pnpm type-check              # tsc --noEmit across workspace
pnpm test                    # tests across workspace
pnpm format                  # prettier write
pnpm docker:up / docker:down # local postgres/redis/minio/mailhog
```

## Conventions for working in this repo

- Shared types go in `@migrationtower/contracts` and are imported, never
  re-declared per package.
- Extend the shared `@migrationtower/tsconfig` / `eslint-config` /
  `prettier-config`; don't fork tool config per package.
- Commits must pass commitlint (Conventional Commits); hooks run lint-staged.
- New backing service → add to `infra/docker/docker-compose.yml` **and**
  `.env.example`.
- Don't weaken a shared config to make one package pass — fix the package.

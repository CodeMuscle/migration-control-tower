# Changelog

## [Unreleased]

- feat(api,db): Source Ingestion (blueprint Module 4)
  - **S3/MinIO** (`@aws-sdk/client-s3` + presigner): 15-min presigned PUT,
    HEAD verification, key pattern
    `tenants/{tenant_id}/projects/{project_id}/uploads/{upload_id}/{filename}`.
  - Upload lifecycle: `POST /v1/projects/:projectId/uploads/presign`
    (per-tenant size quota from `feature_entitlements`, pending
    `source_uploads` row, presigned URL), `…/uploads/complete` (HEAD verify →
    `source_uploads`=uploaded → `source_batches`=queued → enqueue
    `upload-processing` BullMQ job with the **exact** blueprint payload
    `{tenantId,projectId,batchId,uploadId,objectKey,sourceType}`),
    `GET /v1/projects/:projectId/sources` (data sources + latest batch
    status), `GET /v1/source-batches/:batchId`.
  - **Idempotency-Key** on presign: `idempotency_keys` table (new Prisma
    model + migration), `(tenant_id, idempotency_key)` → response, 24h TTL,
    cached replay.
  - **SSE** `GET /v1/source-batches/:batchId/events`: emits a `snapshot`
    frame (current status — so the queued state is visible even if you
    connect after `complete`) then streams `source.batch.*` events for that
    batch via the EventBus stub. Bypasses the success-envelope interceptor
    (`@SkipEnvelope()`).
  - Emits `source.upload.registered`, `source.upload.completed`,
    `source.batch.created`.
  - Verified end-to-end against **real MinIO + Redis + Postgres**: presign →
    real HTTP PUT to MinIO → idempotent replay → complete → batch=queued →
    BullMQ job present with exact contract payload → SSE snapshot=queued.
    Existing integration tests still 3/3 (migration chain applies cleanly).

- feat(api): Tenant + Migration Projects modules (blueprint Modules 2 & 3)
  - **Tenant**: `GET /v1/tenant`, `PATCH /v1/tenant/settings`,
    `GET /v1/tenant/features` (process-wide 1-min TTL cache, singleton
    `FeatureCache`). Emits `tenant.settings.updated` and
    `tenant.feature.updated` via the EventBus stub.
  - **Migration Projects**: `POST /v1/migration-projects` (per-tenant
    `project_code` uniqueness → `CONFLICT`); `GET /v1/migration-projects`
    (filters status/stage/ownerUserId/search, **keyset/cursor** pagination,
    not offset); `GET /v1/migration-projects/:id` (project + last 10 activity - summary: `lastBatchStatus`, `openIssuesCount` placeholder until Module
    8); `POST /:id/advance-stage` (server-enforced state machine); `GET
/:id/activity` (cursor paginated). Emits `migration_project.created`,
    `.stage_changed`, `.blocked`, `.completed`.
  - **Stage machine** (`stage-machine.ts`, pure/unit-testable): setup →
    ingestion → mapping → validation → dry_run → cutover → complete, with a
    `blocked` status side-branch from any stage and resume; illegal moves →
    `CONFLICT`. `advance-stage` writes `migration_stage_history` + a
    `project_activity` row in one transaction.
  - **Project members**: `POST /:id/members`, `DELETE /:id/members/:memberId`
    (tenant-internal RBAC; customer-portal magic-link auth is later).
  - Per-endpoint Pino structured logging (`tenant_id`, `user_id`,
    `project_id`).
  - Contracts extended (cursor list/detail/summary/activity/members/
    advance-stage incl. `blocked`).
  - Integration tests: Vitest + testcontainers Postgres against the committed
    migrations — tenant-scoping isolation (cross-tenant read → 404), stage
    transition rejection, per-tenant `project_code` uniqueness. 3/3 pass.

- feat(api): Module 3 — NestJS 10 API service (`services/api`)
  - NestJS 10 on Fastify (`@nestjs/platform-fastify`), ESM, built/run via the
    Nest CLI; serves `:4000`.
  - Global concerns: success-envelope interceptor; `AllExceptionsFilter`
    (canonical error envelope + ApiErrorCode taxonomy, incl. ZodError →
    VALIDATION_FAILED); `ZodValidationPipe` (validates contracts' Zod DTOs —
    no class-validator); `nestjs-pino` with `request_id`/`tenant_id` (+ OTel
    `trace_id`) on every line; OpenTelemetry auto-instrumentation (HTTP/PG/
    Redis, console exporter). Fastify owns `request.id` (honours
    `x-request-id`) so logs and envelopes correlate.
  - Auth: Clerk (`@clerk/backend`) global `AuthGuard` — Bearer → Clerk user →
    local `users` (by email) → `X-Tenant-Id` vs active `memberships`;
    `@Public()` / `@SkipTenantCheck()` opt-outs. Rejections use
    AUTH_REQUIRED / TENANT_FORBIDDEN.
  - `common` module (the brief's `@app/api/common`): request-scoped
    `TenantContextService`, `PrismaService` wrapping `prismaForTenant`,
    in-memory `EventBus` stub.
  - Identity module (blueprint Module 1): `POST /v1/auth/invitations`,
    `POST /v1/auth/invitations/accept`, `GET /v1/me`. Plus `GET /health`
    (public) and `GET /v1/_introspect` (echoes resolved TenantContext).
  - tsconfig/eslint per-package deviations for NestJS DI documented in
    CLAUDE.md. New env: `CLERK_SECRET_KEY`, `LOG_LEVEL`, `OTEL_SERVICE_NAME`.
  - Verified end-to-end: server boots `:4000`; `/health` → success envelope;
    unauthed `/v1/me` → 401 AUTH_REQUIRED envelope; invalid token →
    AUTH_REQUIRED; **and** a real Clerk JWT + `X-Tenant-Id` → `/v1/me`
    returns the seeded user + tenant + roles in the success envelope.
  - Seed: `SEED_DEMO_EMAIL` overrides the demo operator email (so it can be
    matched to a Clerk user's primary email); seed log now prints tenant/user
    ids.

- feat(db,contracts,ui): Module 2 — database layer + shared contracts
  - **packages/db**: Prisma 5 (`multiSchema` preview, single `public` schema).
    Models for all 20 tables of blueprint Modules 1–6 (Identity, Tenant,
    Migration Projects, Source Ingestion, Schema Registry, Mapping) — UUID PKs
    (`@db.Uuid`), CITEXT emails, TIMESTAMPTZ, JSONB, every unique/index from
    the blueprint. Initial migration adds `CREATE EXTENSION citext/pgcrypto`,
    CHECK constraints for all enum-like columns, and the 3 partial indexes.
    `prismaForTenant(tenantId)` auto-injects/overrides `tenant_id` on every
    query (tenancy enforcement point); base `prisma` for global/seed only.
    Idempotent seed: demo tenant + user + owner membership + settings + global
    CRM destination schema. Verified: `migrate dev` creates all tables, `seed`
    populates, scoped client blocks cross-tenant reads.
  - **packages/contracts**: Zod schemas + `z.infer` types for the canonical
    envelope (success/error), shared enums, Modules 1–6 request/response DTOs,
    job envelope + validation handoff, and all blueprint domain events. Builds
    to consumable `.d.ts`.
  - **packages/ui**: Tailwind + shadcn/ui baseline — shared `tailwind-preset`,
    `cn()`, `Button` (cva), token `globals.css`, `components.json`.
  - CLAUDE.md: recorded realized stack choices (Prisma/Zod/Tailwind+shadcn),
    the `prismaForTenant` tenancy rule, and the `@app/*` vs `@migrationtower/*`
    scope caveat.

- chore: reconcile bootstrap against canonical design docs

  The Module 1 bootstrap was inferred without `/docs/design/` present. With
  `tech-stack.csv`, `lld.docx`, and `database-blueprint.docx` now in place,
  the inferred decisions were reconciled to match the docs verbatim:
  - **Tech stack** (`CLAUDE.md`): replaced the inferred table with the
    `tech-stack.csv` matrix (Layer / Recommended stack / Why). Dropped the
    inferred "Fastify + Prisma + Zod + Vitest defaults" framing — the CSV
    lists alternatives (e.g. NestJS or Fastify) chosen per module.
  - **Module list** (`CLAUDE.md`): replaced with the LLD's exact 14 modules
    in LLD order. Corrected three bootstrap errors: Sync is module 10 and
    Cutover is 11 (were swapped); SDK is not a module (it is the
    sdk-core/sdk-react packages); the cross-cutting modules are three
    distinct modules — Notification (12), Analytics (13), Audit (14) — not
    the inferred "Notifications & Webhooks" + "Audit, Observability &
    Reporting" pair. Implementation order updated to the LLD's; Sync remains
    built last.
  - **API envelope** (`packages/contracts/src/envelope.ts`): replaced the
    inferred `{ data, error, meta }` (always-present `data`/`error`, plus
    `tenantId`/`pagination` in meta) with the blueprint's canonical shape —
    success `{ data, meta }`, error `{ error: { code, message, details[] },
meta }`, `meta` always `{ requestId, timestamp }`. Added the
    `ApiErrorCode` taxonomy as a const union, `ApiErrorDetail`
    (`{ field, issue }`), and an `isApiSuccess` narrowing helper. No
    application consumers existed (response interceptor / exception filter /
    SDK client are still Module-1 placeholders), so only the contract and
    its doc comments changed.
  - **Tenant context resolution** (`CLAUDE.md`, `contracts/tenant.ts`):
    documented the blueprint's header contract precisely — `Authorization:
Bearer <token>`, `X-Tenant-Id: <tenant_uuid>`, `Idempotency-Key: <uuid>`
    on mutating workflows — and the app-level (non-RLS) resolution mechanism:
    validate `X-Tenant-Id` against the user's active memberships, reject with
    `AUTH_REQUIRED` or `TENANT_FORBIDDEN`. The auth guard itself is owned by
    the Identity module (built first) and is not yet implemented; this is the
    spec it must satisfy.
  - **npm scope**: confirmed `@migrationtower/*`. The docs name the product
    "Customer Migration Control Tower" with no brand rename, so no scope
    change was required.
  - **Repo layout**: scaffolded `infra/terraform/` and `infra/monitoring/`
    (README placeholders) to match the LLD's recommended
    `infra/{docker,terraform,monitoring}`. Documented the two intentional,
    doc-justified deviations from the LLD's illustrative sketch — `packages/db`
    (mandated by the blueprint) and `apps/docs-site` (additive, not in the LLD)
    — in `CLAUDE.md` rather than silently dropping them.
  - Removed `docs/design/ASSUMPTIONS.md` (fully reconciled) and refreshed
    `docs/design/README.md`, root `README.md`, and the `CLAUDE.md` provenance
    note to reflect that `/docs/design/` is now the realized single source of
    truth.

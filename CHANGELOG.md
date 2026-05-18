# Changelog

## [Unreleased]

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

# Bootstrap Assumptions — to reconcile against the real design docs

The Module 1 bootstrap ran **without** `/docs/design/lld.*`, `database-blueprint.docx`,
or `tech-stack.csv` present. Everything below was inferred from the Module 1 task brief
and standard practice for a multi-tenant migration SaaS. Each item must be confirmed (or
corrected) when the real docs arrive.

## 1. Tech stack

- The brief fixes: Turborepo, pnpm, TypeScript 5.4+, Node 20 LTS, BullMQ, Postgres,
  Redis, MinIO (S3), Mailhog. Web framework, ORM, API framework, and auth provider were
  **not specified** and are recorded in `CLAUDE.md` as _recommended defaults_ (Next.js,
  Prisma, Fastify, etc.), not requirements. Replace with `tech-stack.csv` values verbatim.

## 2. Module list (14)

- The brief enumerates an implementation order of **12** named modules. The brief also
  says there are **14 modules in the LLD**. The 2 extra modules in `CLAUDE.md`
  — _Notifications & Webhooks_ and _Audit, Observability & Reporting_ — are **inferred
  cross-cutting modules**. Confirm the real names/scope from the LLD.

## 3. Common API envelope

- `database-blueprint.docx` defines the canonical response envelope. It was unavailable,
  so `packages/contracts/src/envelope.ts` implements a conventional
  `{ data, error, meta }` shape. **This is the most likely thing to be wrong** — verify
  field names (`requestId` vs `request_id`, error `code` taxonomy, pagination shape)
  against the blueprint and update the type + `CLAUDE.md` together.

## 4. Multi-tenancy

- Assumed: every domain table carries a `tenant_id` column; tenant context is resolved
  from auth in middleware. Brief states this explicitly, but the _mechanism_ (RLS vs.
  app-level scoping, header vs. subdomain vs. JWT claim) is inferred — confirm in LLD.

## 5. Package scope

- npm scope chosen: `@migrationtower/*`. Cosmetic; rename if the docs/brand dictate.

## Reconciliation checklist (run when docs arrive)

- [ ] Replace tech stack table in `CLAUDE.md` from `tech-stack.csv`
- [ ] Replace 14-module list in `CLAUDE.md` from LLD
- [ ] Replace `ApiEnvelope` in `packages/contracts` from `database-blueprint.docx`
- [ ] Confirm tenant-resolution mechanism and document it precisely
- [ ] Delete this file once fully reconciled

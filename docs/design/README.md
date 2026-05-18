# Design Docs — `/docs/design/`

This directory is the **single source of truth** for the Customer Migration Control Tower
system design. Read everything here before implementing any module.

## Documents

| File                      | Purpose                                                                  | Status      |
| ------------------------- | ------------------------------------------------------------------------ | ----------- |
| `lld.docx`                | Low-Level Design: the 14 modules, their responsibilities, sequence flows | ✅ Supplied |
| `database-blueprint.docx` | DB schema, multi-tenant model, the canonical API response **envelope**   | ✅ Supplied |
| `tech-stack.csv`          | Authoritative tech-stack matrix (layer → recommended stack → rationale)  | ✅ Supplied |

## Reconciled (2026-05-17)

The bootstrap (Module 1) was scaffolded before these documents existed, so the
module list, API envelope, and tech stack in [`/CLAUDE.md`](../../CLAUDE.md) were
inferred from the Module 1 brief. The repo has since been reconciled against the
documents above: `CLAUDE.md`, `packages/contracts` (the envelope type and tenant
context), and the module list now match `/docs/design/` verbatim. The
inferred-decisions file (`ASSUMPTIONS.md`) was resolved and removed; see
[`/CHANGELOG.md`](../../CHANGELOG.md).

These documents remain the **single source of truth**. If they change, they win —
update `CLAUDE.md` and `packages/contracts` to match.

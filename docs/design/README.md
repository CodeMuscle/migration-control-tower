# Design Docs — `/docs/design/`

This directory is the **single source of truth** for the Customer Migration Control Tower
system design. Read everything here before implementing any module.

## Expected documents

| File                      | Purpose                                                                    | Status                  |
| ------------------------- | -------------------------------------------------------------------------- | ----------------------- |
| `lld.md` / `lld.docx`     | Low-Level Design: the 14 modules, their responsibilities, sequence flows   | ⚠️ **Not yet supplied** |
| `database-blueprint.docx` | DB schema, multi-tenant model, the canonical API response **envelope**     | ⚠️ **Not yet supplied** |
| `tech-stack.csv`          | Authoritative tech-stack matrix (layer → technology → version → rationale) | ⚠️ **Not yet supplied** |

## ⚠️ Important: bootstrap was done without the source docs

At the time the monorepo was bootstrapped (Module 1), the three documents above were
**not present in the repository**. The scaffold, the module list, the API envelope, and
the tech stack recorded in [`/CLAUDE.md`](../../CLAUDE.md) were therefore derived from the
**Module 1 task specification itself**, not from the design docs.

See [`ASSUMPTIONS.md`](./ASSUMPTIONS.md) for the full list of inferred decisions that must
be reconciled once the real LLD / database-blueprint / tech-stack land here.

When the real documents arrive, drop them in this folder and run a reconciliation pass:
update `CLAUDE.md`, `packages/contracts` (the envelope type), and the module list to match.

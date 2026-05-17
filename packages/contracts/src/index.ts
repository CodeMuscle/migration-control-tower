/**
 * @migrationtower/contracts — canonical cross-package contracts.
 *
 * ⚠️ The API envelope below is the conventional `{ data, error, meta }` shape.
 * The authoritative definition lives in `/docs/design/database-blueprint.docx`,
 * which was NOT available at bootstrap. Reconcile field names against the
 * blueprint before any client/server depends on the exact shape.
 * See /docs/design/ASSUMPTIONS.md.
 */

export * from "./envelope.js";
export * from "./tenant.js";
export * from "./job.js";

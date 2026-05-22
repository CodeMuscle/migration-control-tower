/**
 * Domain events emitted by Modules 1–6, verbatim from
 * /docs/design/database-blueprint.docx ("Domain events" per module).
 * Events are tenant-scoped and carry a correlation id.
 */
import { z } from "zod";

export const DOMAIN_EVENTS = [
  // Module 1 — Identity
  "identity.invitation.created",
  "identity.invitation.accepted",
  "identity.membership.revoked",
  // Module 2 — Tenant
  "tenant.created",
  "tenant.settings.updated",
  "tenant.feature.updated",
  // Module 3 — Migration Projects
  "migration_project.created",
  "migration_project.stage_changed",
  "migration_project.blocked",
  "migration_project.completed",
  // Module 4 — Source Ingestion
  "source.upload.registered",
  "source.upload.completed",
  "source.batch.created",
  "source.batch.progress",
  "source.batch.parsed",
  "source.batch.failed",
  // Module 5 — Schema Registry
  "schema.source_snapshot.created",
  "schema.destination_activated",
  "schema.source_snapshot.refreshed",
  // Module 6 — Mapping
  "mapping.draft.updated",
  "mapping.version.published",
  "mapping.template.applied",
] as const;

export const DomainEventNameSchema = z.enum(DOMAIN_EVENTS);
export type DomainEventName = z.infer<typeof DomainEventNameSchema>;

/** Envelope every emitted domain event is wrapped in. */
export const domainEventSchema = <T extends z.ZodTypeAny>(payload: T) =>
  z.object({
    name: DomainEventNameSchema,
    tenantId: z.string().uuid(),
    /** Correlation id, propagated from the originating request/job. */
    requestId: z.string(),
    occurredAt: z.string().datetime({ offset: true }),
    payload,
  });

export type DomainEvent<TPayload> = {
  name: DomainEventName;
  tenantId: string;
  requestId: string;
  occurredAt: string;
  payload: TPayload;
};

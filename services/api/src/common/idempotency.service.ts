/**
 * Idempotency-Key replay. For mutating workflows (uploads/presign): the first
 * request stores its response keyed by (tenant_id, idempotency_key); retries
 * within 24h get the exact same response back instead of re-executing.
 */
import { Injectable } from "@nestjs/common";

import { PrismaService } from "./prisma.service.js";

const TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  /** Cached response for this key, or null (miss/expired). */
  async get<T>(tenantId: string, key: string, endpoint: string): Promise<T | null> {
    const row = await this.prisma.tenant.idempotencyKey.findUnique({
      where: { tenantId_idempotencyKey: { tenantId, idempotencyKey: key } },
    });
    if (!row || row.endpoint !== endpoint) return null;
    if (row.expiresAt.getTime() < Date.now()) {
      await this.prisma.tenant.idempotencyKey.deleteMany({
        where: { id: row.id },
      });
      return null;
    }
    return row.response as T;
  }

  /** Persist the response for replay. First-writer-wins on the unique key. */
  async save(tenantId: string, key: string, endpoint: string, response: unknown): Promise<void> {
    await this.prisma.tenant.idempotencyKey.upsert({
      where: { tenantId_idempotencyKey: { tenantId, idempotencyKey: key } },
      update: {},
      create: {
        tenantId,
        idempotencyKey: key,
        endpoint,
        response: response as object,
        expiresAt: new Date(Date.now() + TTL_MS),
      },
    });
  }
}

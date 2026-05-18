/**
 * Process-wide feature-entitlement cache, 1-minute TTL (brief). A singleton
 * (not request-scoped) so entries survive across requests; keyed by tenant.
 * Swap for Redis when multi-instance.
 */
import { Injectable } from "@nestjs/common";

const TTL_MS = 60_000;

interface Entry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class FeatureCache {
  private readonly store = new Map<string, Entry<unknown>>();

  get<T>(tenantId: string): T | undefined {
    const hit = this.store.get(tenantId);
    if (!hit) return undefined;
    if (Date.now() > hit.expiresAt) {
      this.store.delete(tenantId);
      return undefined;
    }
    return hit.value as T;
  }

  set<T>(tenantId: string, value: T): void {
    this.store.set(tenantId, { value, expiresAt: Date.now() + TTL_MS });
  }

  invalidate(tenantId: string): void {
    this.store.delete(tenantId);
  }
}

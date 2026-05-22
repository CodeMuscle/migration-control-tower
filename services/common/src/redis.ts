/**
 * Shared Redis connection helpers. BullMQ accepts an ioredis ConnectionOptions
 * shape; we derive it from REDIS_URL so all services (API producer, workers,
 * test harness) connect identically.
 */
import type { ConnectionOptions } from "bullmq";

export function redisConnection(): ConnectionOptions {
  const url = new URL(process.env.REDIS_URL ?? "redis://localhost:6379");
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    ...(url.password ? { password: url.password } : {}),
    // BullMQ requires this for blocking commands used by Worker.
    maxRetriesPerRequest: null,
  };
}

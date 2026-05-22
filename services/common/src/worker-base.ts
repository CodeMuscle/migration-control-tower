/**
 * Shared BullMQ worker base. Each worker app subclasses or composes this with
 * a typed processor function; the patterns the brief calls out (retry policy,
 * idempotency-skip, chunked progress) live here so they aren't reinvented per
 * queue.
 *
 * - **Retries**: 3 attempts, exponential backoff (5s × 2^n).
 * - **DLQ**: terminal failures are re-enqueued onto `<queue>-dlq` (a sibling
 *   queue) so operators can replay them out-of-band.
 * - **Idempotency**: jobs whose id is already in the Redis `processed` set
 *   (SETNX with 7-day TTL) short-circuit before the processor runs.
 * - **Progress**: the processor calls `ctx.progress(rowsDone, total?)`; BullMQ
 *   fans the event out over Redis (the API bridges it onto SSE).
 */
import { type Job, Queue, Worker } from "bullmq";
import type { ConnectionOptions, WorkerOptions } from "bullmq";
import { Redis as IORedis, type RedisOptions } from "ioredis";

const PROCESSED_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface JobContext<T> {
  readonly job: Job<T>;
  /** Report row-level progress; the API bridges this onto the SSE stream. */
  progress(rowsDone: number, totalRows?: number): Promise<void>;
}

export interface BaseWorkerOptions<T, R> {
  /** Queue name (must match the producer). */
  queue: string;
  connection: ConnectionOptions;
  /** Domain work. Return value lands in BullMQ's `completed` event. */
  process: (ctx: JobContext<T>) => Promise<R>;
  /** Override the default 3-attempts/exp-backoff/DLQ wrapping. */
  workerOptions?: Partial<WorkerOptions>;
}

const DEFAULT_WORKER_OPTIONS = {
  concurrency: 4,
  // BullMQ enforces these per-job from the producer's `add()` opts, but the
  // worker also enforces a hard ceiling so a misconfigured producer can't
  // hammer us with infinite retries.
  maxStalledCount: 1,
  stalledInterval: 30_000,
} satisfies Partial<WorkerOptions>;

export interface WorkerHandle<T, R> {
  worker: Worker<T, R>;
  /** Closes the worker (drain), the DLQ queue and the Redis client. */
  close(): Promise<void>;
}

/** Construct, wire and return the BullMQ Worker. Caller manages lifecycle. */
export function createBaseWorker<T, R = unknown>(
  opts: BaseWorkerOptions<T, R>,
): WorkerHandle<T, R> {
  const dlq = new Queue(`${opts.queue}-dlq`, { connection: opts.connection });
  const processedSet = `mt:processed:${opts.queue}`;
  const redis = new IORedis(opts.connection as unknown as RedisOptions);

  const worker = new Worker<T, R>(
    opts.queue,
    async (job) => {
      // Idempotency check: SETNX returns 1 if newly set, 0 if it existed.
      const fresh = await redis.set(
        `${processedSet}:${job.id}`,
        "1",
        "EX",
        PROCESSED_TTL_SECONDS,
        "NX",
      );
      if (fresh === null) {
        // Already processed — short-circuit without re-running side effects.
        return undefined as unknown as R;
      }

      const ctx: JobContext<T> = {
        job,
        progress: async (rowsDone, totalRows) => {
          await job.updateProgress({ rowsDone, totalRows: totalRows ?? null });
        },
      };

      try {
        return await opts.process(ctx);
      } catch (err) {
        // Drop the processed marker so the next attempt actually runs the
        // domain logic again. (BullMQ handles retry scheduling itself.)
        await redis.del(`${processedSet}:${job.id}`);
        throw err;
      }
    },
    { connection: opts.connection, ...DEFAULT_WORKER_OPTIONS, ...opts.workerOptions },
  );

  worker.on("failed", async (job, err) => {
    if (!job) return;
    if (job.attemptsMade >= (job.opts.attempts ?? 3)) {
      // Terminal failure → DLQ for manual replay.
      await dlq.add(job.name, job.data, {
        jobId: `dlq-${job.id}`,
        removeOnComplete: 10_000,
        removeOnFail: 10_000,
      });
    }
    // eslint-disable-next-line no-console
    console.error(
      `[${opts.queue}] job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`,
    );
  });

  return {
    worker,
    async close() {
      await worker.close();
      await dlq.close();
      await redis.quit();
    },
  };
}

/** Producer-side default job options matching this base worker's retry policy. */
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 5_000 },
  removeOnComplete: 1_000,
  removeOnFail: 5_000,
};

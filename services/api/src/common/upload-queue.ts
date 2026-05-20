/**
 * `upload-processing` BullMQ producer. Job data matches the blueprint's
 * Module-4 queue contract EXACTLY:
 *   { tenantId, projectId, batchId, uploadId, objectKey, sourceType }
 * The job id is derived from batchId so re-enqueuing the same batch is
 * idempotent (CLAUDE.md → Coding conventions §4).
 */
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";

export interface UploadProcessingJob {
  tenantId: string;
  projectId: string;
  batchId: string;
  uploadId: string;
  objectKey: string;
  sourceType: string;
}

export const UPLOAD_PROCESSING_QUEUE = "upload-processing";

function redisConnection() {
  const url = new URL(process.env.REDIS_URL ?? "redis://localhost:6379");
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    ...(url.password ? { password: url.password } : {}),
  };
}

@Injectable()
export class UploadQueue implements OnModuleDestroy {
  private readonly logger = new Logger(UploadQueue.name);
  private readonly queue = new Queue<UploadProcessingJob>(UPLOAD_PROCESSING_QUEUE, {
    connection: redisConnection(),
  });

  async enqueue(job: UploadProcessingJob): Promise<void> {
    await this.queue.add(UPLOAD_PROCESSING_QUEUE, job, {
      // BullMQ forbids ':' in custom job ids.
      jobId: `${UPLOAD_PROCESSING_QUEUE}-${job.batchId}`,
      removeOnComplete: 1000,
      removeOnFail: 5000,
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    });
    this.logger.log(
      { batchId: job.batchId, tenantId: job.tenantId },
      "enqueued upload-processing job",
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}

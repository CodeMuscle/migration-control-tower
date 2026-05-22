/**
 * Bridge from BullMQ `QueueEvents` (Redis pub/sub) to the in-process
 * `EventBus`. Workers run in a separate process; the API can't see their
 * in-memory events, so we lift BullMQ's queue-events onto our bus, keyed by
 * `batchId` so the SSE handler can filter.
 *
 *   worker.job.updateProgress(n)  →  QueueEvents 'progress'   →  source.batch.progress
 *   worker job completed          →  QueueEvents 'completed'  →  source.batch.parsed
 *                                                                + schema.source_snapshot.created
 *   worker job failed             →  QueueEvents 'failed'     →  source.batch.failed
 */
import {
  UPLOAD_PROCESSING_QUEUE,
  UploadProcessingResultSchema,
  type DomainEvent,
  type DomainEventName,
} from "@migrationtower/contracts";
import { redisConnection } from "@migrationtower/services-common";
import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { QueueEvents } from "bullmq";

import { EventBus } from "./event-bus.js";

const JOB_ID_PREFIX = `${UPLOAD_PROCESSING_QUEUE}-`;

function batchIdFromJobId(jobId: string | undefined): string | null {
  if (!jobId || !jobId.startsWith(JOB_ID_PREFIX)) return null;
  return jobId.slice(JOB_ID_PREFIX.length);
}

@Injectable()
export class QueueEventsBridge implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(QueueEventsBridge.name);
  private events: QueueEvents | null = null;

  constructor(private readonly bus: EventBus) {}

  onApplicationBootstrap(): void {
    this.events = new QueueEvents(UPLOAD_PROCESSING_QUEUE, {
      connection: redisConnection(),
    });

    this.events.on("progress", ({ jobId, data }) => {
      const batchId = batchIdFromJobId(jobId);
      if (!batchId) return;
      void this.publish("source.batch.progress", batchId, { progress: data });
    });

    this.events.on("completed", ({ jobId, returnvalue }) => {
      const batchId = batchIdFromJobId(jobId);
      if (!batchId) return;
      // returnvalue is JSON-serialised by BullMQ; safely parse.
      let snapshotId: string | undefined;
      let rowCount: number | undefined;
      try {
        const result = typeof returnvalue === "string" ? JSON.parse(returnvalue) : returnvalue;
        const ok = UploadProcessingResultSchema.safeParse(result);
        if (ok.success) {
          snapshotId = ok.data.snapshotId;
          rowCount = ok.data.rowCount;
        }
      } catch {
        /* ignore malformed return value */
      }
      void this.publish("source.batch.parsed", batchId, { snapshotId, rowCount });
      if (snapshotId) {
        void this.publish("schema.source_snapshot.created", batchId, {
          snapshotId,
        });
      }
    });

    this.events.on("failed", ({ jobId, failedReason }) => {
      const batchId = batchIdFromJobId(jobId);
      if (!batchId) return;
      void this.publish("source.batch.failed", batchId, { error: failedReason });
    });

    this.logger.log(`attached to QueueEvents("${UPLOAD_PROCESSING_QUEUE}")`);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.events?.close();
  }

  private async publish(
    name: Extract<
      DomainEventName,
      | "source.batch.progress"
      | "source.batch.parsed"
      | "source.batch.failed"
      | "schema.source_snapshot.created"
    >,
    batchId: string,
    extra: Record<string, unknown>,
  ): Promise<void> {
    // tenantId/requestId aren't known at the BullMQ layer; SSE filters by
    // batchId only. The stub bus doesn't validate, so empty strings are fine.
    const event: DomainEvent<{ batchId: string } & Record<string, unknown>> = {
      name,
      tenantId: "",
      requestId: "",
      occurredAt: new Date().toISOString(),
      payload: { batchId, ...extra },
    };
    await this.bus.publish(event);
  }
}

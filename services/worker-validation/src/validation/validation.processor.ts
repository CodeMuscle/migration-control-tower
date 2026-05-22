/**
 * `validation` BullMQ worker — placeholder. The worker is attached so the
 * brief's "loads workers for the queues defined in the LLD: upload-processing,
 * validation" is satisfied; actual rule evaluation lands when Module 7
 * (Validation) is fully implemented.
 */
import { VALIDATION_QUEUE } from "@migrationtower/contracts";
import {
  createBaseWorker,
  redisConnection,
  type WorkerHandle,
} from "@migrationtower/services-common";
import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

@Injectable()
export class ValidationProcessor implements OnApplicationBootstrap, OnApplicationShutdown {
  private handle: WorkerHandle<unknown, unknown> | null = null;

  constructor(
    @InjectPinoLogger(ValidationProcessor.name)
    private readonly logger: PinoLogger,
  ) {}

  onApplicationBootstrap(): void {
    this.handle = createBaseWorker<unknown, unknown>({
      queue: VALIDATION_QUEUE,
      connection: redisConnection(),
      process: async (ctx) => {
        this.logger.info(
          { jobId: ctx.job.id },
          "validation job received (stub — full implementation in Module 7)",
        );
        return { stub: true };
      },
    });
    this.logger.info({ queue: VALIDATION_QUEUE }, "validation worker attached (stub)");
  }

  async onApplicationShutdown(): Promise<void> {
    await this.handle?.close();
  }
}

/**
 * Worker entrypoint. NestJS standalone application (no HTTP transport) — the
 * BullMQ Workers are attached by feature modules via `OnApplicationBootstrap`
 * and drained on `OnApplicationShutdown` (which Nest fires on SIGTERM/SIGINT
 * once `enableShutdownHooks()` is called).
 */
// MUST be first: starts the OTel SDK before pg/bullmq/aws-sdk are imported.
import "./otel.js";
import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger as PinoLogger } from "nestjs-pino";

import { AppModule } from "./app.module.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(PinoLogger));
  app.enableShutdownHooks();
  app.get(PinoLogger).log("worker-validation started");
}

void bootstrap();

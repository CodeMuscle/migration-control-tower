/**
 * API entrypoint. OTel is started first (before any other import does I/O so
 * auto-instrumentation can patch http/pg/redis), then Nest on Fastify.
 */
// MUST be first: starts the OTel SDK before @nestjs/http/pg are imported.
import "./otel.js";
import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Logger as PinoLogger } from "nestjs-pino";

import { AppModule } from "./app.module.js";
import { genRequestId } from "./common/request-id.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    // Fastify owns request.id (honours inbound x-request-id, else a UUID);
    // nestjs-pino, the success interceptor and the error filter all read this
    // same id so logs and envelopes correlate.
    new FastifyAdapter({
      trustProxy: true,
      genReqId: (req: { headers: Record<string, string | string[] | undefined> }) =>
        genRequestId(req.headers["x-request-id"]),
    }),
    { bufferLogs: true },
  );

  app.useLogger(app.get(PinoLogger));
  app.enableShutdownHooks();

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
  app.get(PinoLogger).log(`API listening on http://0.0.0.0:${port}`);
}

void bootstrap();

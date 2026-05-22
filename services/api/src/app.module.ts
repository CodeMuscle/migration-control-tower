import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

import { AuthModule } from "./auth/auth.module.js";
import { CommonModule } from "./common/common.module.js";
import { TENANT_CONTEXT_KEY } from "./common/tenant-context.js";
import { HealthController } from "./health/health.controller.js";
import { IdentityModule } from "./identity/identity.module.js";
import { IngestionModule } from "./ingestion/ingestion.module.js";
import { IntrospectController } from "./introspect/introspect.controller.js";
import { MappingModule } from "./mapping/mapping.module.js";
import { ProjectsModule } from "./projects/projects.module.js";
import { SchemaRegistryModule } from "./schema-registry/schema-registry.module.js";
import { TenantModule } from "./tenant/tenant.module.js";

const isDev = process.env.NODE_ENV !== "production";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
        // No genReqId here: Fastify's adapter owns request.id (see main.ts);
        // pino-http picks it up so logs and envelopes share one id.
        // tenant_id + request_id on every log line.
        customProps: (req) => ({
          request_id: (req as { id?: string }).id,
          tenant_id:
            (req as unknown as Record<string, { tenantId?: string } | undefined>)[
              TENANT_CONTEXT_KEY
            ]?.tenantId ?? null,
        }),
        transport: isDev ? { target: "pino-pretty", options: { singleLine: true } } : undefined,
        redact: ["req.headers.authorization"],
      },
    }),
    CommonModule,
    AuthModule,
    IdentityModule,
    TenantModule,
    ProjectsModule,
    IngestionModule,
    SchemaRegistryModule,
    MappingModule,
  ],
  controllers: [HealthController, IntrospectController],
})
export class AppModule {}

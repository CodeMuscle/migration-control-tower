import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

import { UploadProcessingModule } from "./upload-processing/upload-processing.module.js";
import { ValidationModule } from "./validation/validation.module.js";

const isDev = process.env.NODE_ENV !== "production";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
        autoLogging: false,
        transport: isDev ? { target: "pino-pretty", options: { singleLine: true } } : undefined,
      },
    }),
    UploadProcessingModule,
    ValidationModule,
  ],
})
export class AppModule {}

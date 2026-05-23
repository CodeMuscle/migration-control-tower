import { Module } from "@nestjs/common";

import { ValidationQueue } from "./validation-queue.js";
import { ProjectIssuesController, ValidationController } from "./validation.controller.js";
import { ValidationService } from "./validation.service.js";

@Module({
  controllers: [ValidationController, ProjectIssuesController],
  providers: [ValidationService, ValidationQueue],
  exports: [ValidationQueue],
})
export class ValidationModule {}

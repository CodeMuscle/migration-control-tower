import { Module } from "@nestjs/common";

import { MappingController } from "./mapping.controller.js";
import { MappingService } from "./mapping.service.js";

@Module({
  controllers: [MappingController],
  providers: [MappingService],
})
export class MappingModule {}

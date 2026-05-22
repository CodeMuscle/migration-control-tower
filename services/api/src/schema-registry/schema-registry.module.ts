import { Module } from "@nestjs/common";

import { SchemaRegistryController } from "./schema-registry.controller.js";
import { SchemaRegistryService } from "./schema-registry.service.js";

@Module({
  controllers: [SchemaRegistryController],
  providers: [SchemaRegistryService],
})
export class SchemaRegistryModule {}

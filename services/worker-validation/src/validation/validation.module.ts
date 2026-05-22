import { Module } from "@nestjs/common";

import { ValidationProcessor } from "./validation.processor.js";

@Module({ providers: [ValidationProcessor] })
export class ValidationModule {}

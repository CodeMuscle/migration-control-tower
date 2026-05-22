import { Module } from "@nestjs/common";

import { UploadProcessingProcessor } from "./upload-processing.processor.js";

@Module({
  providers: [UploadProcessingProcessor],
  exports: [UploadProcessingProcessor],
})
export class UploadProcessingModule {}

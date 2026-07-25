import { Global, Module } from "@nestjs/common";

import { GeminiEmbeddingService } from "./gemini-embedding.service.js";

@Global()
@Module({
  providers: [GeminiEmbeddingService],
  exports: [GeminiEmbeddingService],
})
export class AiModule {}

import { Module } from "@nestjs/common";

import { SettingsModule } from "../settings/settings.module.js";
import { KnowledgeBaseController } from "./knowledge-base.controller.js";
import { KnowledgeBaseService } from "./knowledge-base.service.js";
import { PrismaKnowledgeBaseRepository } from "./repositories/prisma-knowledge-base.repository.js";
import { KnowledgeBaseRepository } from "./repositories/knowledge-base.repository.js";
import { ChunkingService } from "./services/chunking.service.js";
import { DocumentParserService } from "./services/document-parser.service.js";

@Module({
  imports: [SettingsModule],
  controllers: [KnowledgeBaseController],
  providers: [
    KnowledgeBaseService,
    DocumentParserService,
    ChunkingService,
    {
      provide: KnowledgeBaseRepository,
      useClass: PrismaKnowledgeBaseRepository,
    },
  ],
})
export class KnowledgeBaseModule {}

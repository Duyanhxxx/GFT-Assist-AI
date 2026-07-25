import { Module } from "@nestjs/common";

import { SettingsModule } from "../settings/settings.module.js";
import { AiAgentController } from "./ai-agent.controller.js";
import { AiAgentService } from "./ai-agent.service.js";
import { AiAgentRepository } from "./repositories/ai-agent.repository.js";
import { PrismaAiAgentRepository } from "./repositories/prisma-ai-agent.repository.js";
import { GeminiGroundedResponseService } from "./services/gemini-grounded-response.service.js";
import { GeminiTriageService } from "./services/gemini-triage.service.js";

@Module({
  imports: [SettingsModule],
  controllers: [AiAgentController],
  providers: [
    AiAgentService,
    GeminiGroundedResponseService,
    GeminiTriageService,
    {
      provide: AiAgentRepository,
      useClass: PrismaAiAgentRepository,
    },
  ],
})
export class AiAgentModule {}

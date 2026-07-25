import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AiModule } from "./infrastructure/ai/ai.module.js";
import { PrismaModule } from "./infrastructure/prisma/prisma.module.js";
import { StorageModule } from "./infrastructure/storage/storage.module.js";
import { AiAgentModule } from "./modules/ai-agent/ai-agent.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { AnalyticsModule } from "./modules/analytics/analytics.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { KnowledgeBaseModule } from "./modules/knowledge-base/knowledge-base.module.js";
import { LogsModule } from "./modules/logs/logs.module.js";
import { SettingsModule } from "./modules/settings/settings.module.js";
import { TicketsModule } from "./modules/tickets/tickets.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AiModule,
    PrismaModule,
    StorageModule,
    AiAgentModule,
    AnalyticsModule,
    HealthModule,
    AuthModule,
    TicketsModule,
    KnowledgeBaseModule,
    LogsModule,
    SettingsModule,
  ],
})
export class AppModule {}

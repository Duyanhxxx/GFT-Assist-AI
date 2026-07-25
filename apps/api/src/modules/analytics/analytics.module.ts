import { Module } from "@nestjs/common";

import { AnalyticsController } from "./analytics.controller.js";
import { AnalyticsService } from "./analytics.service.js";
import { AnalyticsRepository } from "./repositories/analytics.repository.js";
import { PrismaAnalyticsRepository } from "./repositories/prisma-analytics.repository.js";

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    {
      provide: AnalyticsRepository,
      useClass: PrismaAnalyticsRepository,
    },
  ],
})
export class AnalyticsModule {}

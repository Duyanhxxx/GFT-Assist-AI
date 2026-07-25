import { Module } from "@nestjs/common";

import { LogsController } from "./logs.controller.js";
import { LogsService } from "./logs.service.js";
import { LogsRepository } from "./repositories/logs.repository.js";
import { PrismaLogsRepository } from "./repositories/prisma-logs.repository.js";

@Module({
  controllers: [LogsController],
  providers: [
    LogsService,
    {
      provide: LogsRepository,
      useClass: PrismaLogsRepository,
    },
  ],
})
export class LogsModule {}

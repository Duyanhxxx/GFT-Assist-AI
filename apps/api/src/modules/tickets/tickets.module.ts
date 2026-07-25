import { Module } from "@nestjs/common";

import { TicketsController } from "./tickets.controller.js";
import { PrismaTicketsRepository } from "./repositories/prisma-tickets.repository.js";
import { TicketsRepository } from "./repositories/tickets.repository.js";
import { TicketsService } from "./tickets.service.js";

@Module({
  controllers: [TicketsController],
  providers: [
    TicketsService,
    {
      provide: TicketsRepository,
      useClass: PrismaTicketsRepository,
    },
  ],
})
export class TicketsModule {}

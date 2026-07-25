import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../../infrastructure/prisma/prisma.service.js";
import { LogsRepository } from "./logs.repository.js";

@Injectable()
export class PrismaLogsRepository extends LogsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async listAiRuns(organizationId: string) {
    const runs = await this.prisma.aiRun.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
      select: {
        id: true,
        type: true,
        model: true,
        promptVersion: true,
        outcome: true,
        confidenceScore: true,
        latencyMs: true,
        totalTokens: true,
        escalated: true,
        createdAt: true,
        ticket: {
          select: {
            id: true,
            subject: true,
          },
        },
      },
    });

    return runs.map((run) => ({
      id: run.id,
      ticketId: run.ticket.id,
      ticketSubject: run.ticket.subject,
      type: run.type,
      model: run.model,
      promptVersion: run.promptVersion,
      outcome: run.outcome,
      confidenceScore: run.confidenceScore,
      latencyMs: run.latencyMs,
      totalTokens: run.totalTokens,
      escalated: run.escalated,
      createdAt: run.createdAt,
    }));
  }
}

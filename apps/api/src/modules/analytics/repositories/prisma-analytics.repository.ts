import { Injectable } from "@nestjs/common";
import { AiDecisionOutcome, Prisma, TicketStatus } from "@prisma/client";

import { PrismaService } from "../../../infrastructure/prisma/prisma.service.js";
import { AnalyticsRepository } from "./analytics.repository.js";

@Injectable()
export class PrismaAnalyticsRepository extends AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getDashboardSummary(organizationId: string) {
    const [totalTickets, pendingTickets, resolvedTickets, escalatedTickets, spamTickets, confidenceAggregate, aiRuns, overrides] =
      await Promise.all([
        this.prisma.ticket.count({ where: { organizationId } }),
        this.prisma.ticket.count({
          where: {
            organizationId,
            status: {
              in: [TicketStatus.NEW, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_CUSTOMER],
            },
          },
        }),
        this.prisma.ticket.count({ where: { organizationId, status: TicketStatus.RESOLVED } }),
        this.prisma.ticket.count({ where: { organizationId, status: TicketStatus.ESCALATED } }),
        this.prisma.ticket.count({ where: { organizationId, status: TicketStatus.SPAM } }),
        this.prisma.ticket.aggregate({
          where: { organizationId },
          _avg: { confidenceScore: true },
        }),
        this.prisma.aiRun.aggregate({
          where: { organizationId },
          _count: { id: true },
          _sum: { totalTokens: true },
          _avg: { latencyMs: true },
        }),
        this.prisma.humanOverride.count({ where: { organizationId } }),
      ]);

    const [aiResolvedRuns, kbRuns] = await Promise.all([
      this.prisma.aiRun.count({
        where: {
          organizationId,
          outcome: AiDecisionOutcome.AUTO_RESOLVED,
        },
      }),
      this.prisma.aiRun.count({
        where: {
          organizationId,
          retrievedChunks: {
            not: Prisma.AnyNull,
          },
        },
      }),
    ]);

    return {
      totalTickets,
      pendingTickets,
      resolvedTickets,
      escalatedTickets,
      spamRate: totalTickets > 0 ? spamTickets / totalTickets : 0,
      averageConfidence: confidenceAggregate._avg.confidenceScore ?? 0,
      aiResolutionRate: aiRuns._count.id > 0 ? aiResolvedRuns / aiRuns._count.id : 0,
      knowledgeBaseUsage: kbRuns,
      humanOverrides: overrides,
      totalTokenUsage: aiRuns._sum.totalTokens ?? 0,
      averageLatencyMs: aiRuns._avg.latencyMs ?? 0,
    };
  }
}

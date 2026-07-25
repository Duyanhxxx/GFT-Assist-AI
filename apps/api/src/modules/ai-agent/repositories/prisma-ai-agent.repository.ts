import { Injectable } from "@nestjs/common";
import { AiRunType, DocumentStatus, MessageAuthorType, type Prisma } from "@prisma/client";

import { PrismaService } from "../../../infrastructure/prisma/prisma.service.js";
import { AiAgentRepository, type PersistTriageResultParams } from "./ai-agent.repository.js";

const ticketSelect = {
  id: true,
  subject: true,
  description: true,
  requesterEmail: true,
  requesterName: true,
  status: true,
  priority: true,
  intentLabel: true,
  confidenceScore: true,
  languageCode: true,
  sentimentLabel: true,
  resolutionSummary: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TicketSelect;

@Injectable()
export class PrismaAiAgentRepository extends AiAgentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findTicketForTriage(organizationId: string, ticketId: string) {
    return this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        organizationId,
      },
      select: {
        id: true,
        organizationId: true,
        subject: true,
        description: true,
        requesterEmail: true,
        requesterName: true,
        status: true,
        priority: true,
        languageCode: true,
        intentLabel: true,
        sentimentLabel: true,
        confidenceScore: true,
      },
    });
  }

  async findTicketForResponse(organizationId: string, ticketId: string) {
    return this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        organizationId,
      },
      select: {
        id: true,
        organizationId: true,
        subject: true,
        description: true,
        requesterEmail: true,
        requesterName: true,
        status: true,
        priority: true,
        languageCode: true,
        intentLabel: true,
        sentimentLabel: true,
        confidenceScore: true,
        resolutionSummary: true,
      },
    });
  }

  async retrieveKnowledgeChunks(params: {
    organizationId: string;
    query: string;
    keywords: string[];
    topK: number;
    queryEmbedding?: number[];
  }) {
    if (params.queryEmbedding?.length) {
      const vectorMatches = await this.tryVectorRetrieval({
        organizationId: params.organizationId,
        topK: params.topK,
        queryEmbedding: params.queryEmbedding,
      });

      if (vectorMatches.length > 0) {
        return vectorMatches;
      }
    }

    const terms = params.keywords.length > 0 ? params.keywords : [params.query];
    const candidates = await this.prisma.knowledgeChunk.findMany({
      where: {
        organizationId: params.organizationId,
        document: {
          status: DocumentStatus.READY,
        },
        OR: terms.map((term) => ({
          content: {
            contains: term,
            mode: "insensitive",
          },
        })),
      },
      take: 50,
      select: {
        id: true,
        chunkIndex: true,
        content: true,
        documentId: true,
        document: {
          select: {
            title: true,
          },
        },
      },
    });

    return candidates
      .map((chunk) => ({
        chunkId: chunk.id,
        documentId: chunk.documentId,
        documentTitle: chunk.document.title,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        score: this.scoreChunk(chunk.content, terms, params.query),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, params.topK)
      .map(({ score: _score, ...chunk }) => chunk);
  }

  async persistTriageResult(params: PersistTriageResultParams) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.update({
        where: {
          id: params.ticketId,
        },
        data: {
          status: params.ticketUpdate.status,
          priority: params.ticketUpdate.priority,
          languageCode: params.ticketUpdate.languageCode,
          intentLabel: params.ticketUpdate.intentLabel,
          sentimentLabel: params.ticketUpdate.sentimentLabel,
          spamScore: params.ticketUpdate.spamScore,
          duplicateScore: params.ticketUpdate.duplicateScore,
          urgencyScore: params.ticketUpdate.urgencyScore,
          confidenceScore: params.ticketUpdate.confidenceScore,
          resolutionSummary: params.ticketUpdate.resolutionSummary,
          ...(params.ticketUpdate.resolvedAt ? { resolvedAt: params.ticketUpdate.resolvedAt } : {}),
          ...(params.ticketUpdate.escalatedAt ? { escalatedAt: params.ticketUpdate.escalatedAt } : {}),
        },
        select: ticketSelect,
      });

      const aiRunRecord = await tx.aiRun.create({
        data: {
          organizationId: params.organizationId,
          ticketId: params.ticketId,
          type: AiRunType.TRIAGE,
          provider: "gemini",
          model: params.model,
          promptVersion: params.promptVersion,
          structuredOutput: params.structuredOutput as Prisma.InputJsonValue,
          responseText: params.responseText,
          confidenceScore: params.confidenceScore,
          promptTokens: params.promptTokens,
          completionTokens: params.completionTokens,
          totalTokens: params.totalTokens,
          outcome: params.outcome,
          escalated: params.escalated,
        },
        select: {
          id: true,
          model: true,
          outcome: true,
          confidenceScore: true,
          responseText: true,
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
          createdAt: true,
        },
      });

      return {
        ticket,
        aiRun: {
          ...aiRunRecord,
          type: "TRIAGE" as const,
        },
      };
    });
  }

  async persistGroundedResponse(params: Parameters<AiAgentRepository["persistGroundedResponse"]>[0]) {
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.update({
        where: {
          id: params.ticketId,
        },
        data: {
          status: params.ticketUpdate.status,
          priority: params.ticketUpdate.priority,
          resolutionSummary: params.ticketUpdate.resolutionSummary,
          ...(params.ticketUpdate.resolvedAt ? { resolvedAt: params.ticketUpdate.resolvedAt } : {}),
          ...(params.ticketUpdate.escalatedAt ? { escalatedAt: params.ticketUpdate.escalatedAt } : {}),
        },
        select: ticketSelect,
      });

      await tx.ticketMessage.create({
        data: {
          ticketId: params.ticketId,
          authorType: MessageAuthorType.AGENT,
          content: params.messageContent,
          citations: params.citations as Prisma.InputJsonValue,
        },
      });

      const aiRunRecord = await tx.aiRun.create({
        data: {
          organizationId: params.organizationId,
          ticketId: params.ticketId,
          type: AiRunType.RESPONSE,
          provider: "gemini",
          model: params.model,
          promptVersion: params.promptVersion,
          structuredOutput: params.structuredOutput as Prisma.InputJsonValue,
          retrievedChunks: params.retrievedChunks as Prisma.InputJsonValue,
          citations: params.citations as Prisma.InputJsonValue,
          responseText: params.responseText,
          confidenceScore: params.confidenceScore,
          promptTokens: params.promptTokens,
          completionTokens: params.completionTokens,
          totalTokens: params.totalTokens,
          outcome: params.outcome,
          escalated: params.escalated,
        },
        select: {
          id: true,
          model: true,
          outcome: true,
          confidenceScore: true,
          responseText: true,
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
          createdAt: true,
        },
      });

      const messages = await tx.ticketMessage.findMany({
        where: {
          ticketId: params.ticketId,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          authorType: true,
          content: true,
          citations: true,
          createdAt: true,
        },
      });

      return {
        ticket,
        aiRun: {
          ...aiRunRecord,
          type: "RESPONSE" as const,
        },
        messages: messages.map((message) => ({
          id: message.id,
          authorType: message.authorType,
          content: message.content,
          citations: Array.isArray(message.citations)
            ? (message.citations as Array<{
                chunkId: string;
                documentId: string;
                documentTitle: string;
                chunkIndex: number;
                excerpt: string;
              }>)
            : null,
          createdAt: message.createdAt,
        })),
      };
    });
  }

  private scoreChunk(content: string, terms: string[], query: string) {
    const loweredContent = content.toLowerCase();
    const loweredQuery = query.toLowerCase();
    const queryBoost = loweredContent.includes(loweredQuery) ? 3 : 0;

    return terms.reduce((score, term) => {
      return score + (loweredContent.includes(term.toLowerCase()) ? 1 : 0);
    }, queryBoost);
  }

  private async tryVectorRetrieval(params: {
    organizationId: string;
    topK: number;
    queryEmbedding: number[];
  }) {
    try {
      const vectorLiteral = `[${params.queryEmbedding.join(",")}]`;
      const rows = await this.prisma.$queryRawUnsafe<
        Array<{
          chunkId: string;
          documentId: string;
          documentTitle: string;
          chunkIndex: number;
          content: string;
        }>
      >(
        `
          SELECT
            kc.id AS "chunkId",
            kc."documentId" AS "documentId",
            kd.title AS "documentTitle",
            kc."chunkIndex" AS "chunkIndex",
            kc.content AS "content"
          FROM "KnowledgeChunk" kc
          INNER JOIN "KnowledgeDocument" kd ON kd.id = kc."documentId"
          WHERE
            kc."organizationId" = $1
            AND kd.status = 'READY'
            AND kc.embedding IS NOT NULL
          ORDER BY kc.embedding <=> CAST($2 AS vector)
          LIMIT $3
        `,
        params.organizationId,
        vectorLiteral,
        params.topK,
      );

      return rows;
    } catch {
      return [];
    }
  }
}

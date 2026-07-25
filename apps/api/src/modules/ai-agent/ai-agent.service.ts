import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AiDecisionOutcome, TicketStatus, type TicketPriority } from "@prisma/client";

import { GeminiEmbeddingService } from "../../infrastructure/ai/gemini-embedding.service.js";
import type { RequestUser } from "../auth/types/request-user.type.js";
import { SettingsService } from "../settings/settings.service.js";
import { AiAgentRepository } from "./repositories/ai-agent.repository.js";
import { GeminiGroundedResponseService } from "./services/gemini-grounded-response.service.js";
import { GeminiTriageService } from "./services/gemini-triage.service.js";

const PROMPT_VERSION = "gemini-triage-v1";
const RESPONSE_PROMPT_VERSION = "gemini-grounded-response-v1";

@Injectable()
export class AiAgentService {
  constructor(
    private readonly aiAgentRepository: AiAgentRepository,
    private readonly embeddingService: GeminiEmbeddingService,
    private readonly geminiGroundedResponseService: GeminiGroundedResponseService,
    private readonly geminiTriageService: GeminiTriageService,
    private readonly settingsService: SettingsService,
  ) {}

  async triageTicket(user: RequestUser, ticketId: string) {
    const organizationId = this.requireOrganization(user);
    const settings = await this.settingsService.getSettingsForOrganization(organizationId);
    const ticket = await this.aiAgentRepository.findTicketForTriage(organizationId, ticketId);

    if (!ticket) {
      throw new NotFoundException("Ticket not found.");
    }

    const triage = await this.geminiTriageService.triageTicket(ticket, {
      model: settings.aiModel,
      temperature: settings.temperature,
      confidenceThreshold: settings.confidenceThreshold,
    });
    const decision = this.decideOutcome(triage.parsed, settings.confidenceThreshold);
    const now = new Date();
    const result = await this.aiAgentRepository.persistTriageResult({
      ticketId,
      organizationId,
      model: triage.model,
      promptVersion: PROMPT_VERSION,
      structuredOutput: {
        ...triage.parsed,
        outcome: decision.outcome,
        ticketStatus: decision.status,
      },
      responseText: triage.rawText,
      confidenceScore: triage.parsed.confidenceScore,
      promptTokens: triage.usage.promptTokens,
      completionTokens: triage.usage.completionTokens,
      totalTokens: triage.usage.totalTokens,
      outcome: decision.outcome,
      escalated: decision.status === TicketStatus.ESCALATED,
      ticketUpdate: {
        status: decision.status,
        priority: triage.parsed.priority as TicketPriority,
        languageCode: triage.parsed.languageCode,
        intentLabel: triage.parsed.intentLabel,
        sentimentLabel: triage.parsed.sentimentLabel,
        spamScore: triage.parsed.spamScore,
        duplicateScore: triage.parsed.duplicateScore,
        urgencyScore: triage.parsed.urgencyScore,
        confidenceScore: triage.parsed.confidenceScore,
        resolutionSummary: this.buildSummary(triage.parsed),
        ...(decision.status === TicketStatus.RESOLVED ? { resolvedAt: now } : {}),
        ...(decision.status === TicketStatus.ESCALATED ? { escalatedAt: now } : {}),
      },
    });

    return {
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  async generateGroundedResponse(user: RequestUser, ticketId: string) {
    const organizationId = this.requireOrganization(user);
    const settings = await this.settingsService.getSettingsForOrganization(organizationId);
    const ticket = await this.aiAgentRepository.findTicketForResponse(organizationId, ticketId);

    if (!ticket) {
      throw new NotFoundException("Ticket not found.");
    }

    const query = `${ticket.subject}\n${ticket.description}`.trim();
    const keywords = this.extractKeywords(query);
    let queryEmbedding: number[] | undefined;

    try {
      queryEmbedding = (await this.embeddingService.embedTexts([query], settings.embeddingModel))[0];
    } catch {
      queryEmbedding = undefined;
    }

    const retrievedChunks = await this.aiAgentRepository.retrieveKnowledgeChunks({
      organizationId,
      query,
      keywords,
      topK: settings.retrievalTopK,
      ...(queryEmbedding ? { queryEmbedding } : {}),
    });

    if (retrievedChunks.length === 0) {
      const now = new Date();
      const result = await this.aiAgentRepository.persistGroundedResponse({
        ticketId,
        organizationId,
        model: "knowledge-unavailable",
        promptVersion: RESPONSE_PROMPT_VERSION,
        structuredOutput: {
          outcome: "ESCALATE",
          reason: "No knowledge chunks matched the ticket content.",
        },
        retrievedChunks: [],
        citations: [],
        responseText: "No grounded knowledge was available for this request.",
        confidenceScore: 0,
        promptTokens: null,
        completionTokens: null,
        totalTokens: null,
        outcome: AiDecisionOutcome.ESCALATED,
        escalated: true,
        messageContent:
          "I could not find verified knowledge to answer this request safely, so the ticket has been escalated to a human operator.",
        ticketUpdate: {
          status: TicketStatus.ESCALATED,
          priority: ticket.priority,
          resolutionSummary: "No retrieved knowledge was available. Escalated to a human operator.",
          escalatedAt: now,
        },
      });

      return {
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
    }

    const groundedResponse = await this.geminiGroundedResponseService.generateResponse(ticket, retrievedChunks, {
      model: settings.aiModel,
      temperature: settings.temperature,
      confidenceThreshold: settings.confidenceThreshold,
    });
    const citations = groundedResponse.parsed.citationChunkIds
      .map((chunkId) => retrievedChunks.find((chunk) => chunk.chunkId === chunkId))
      .filter((chunk): chunk is NonNullable<typeof chunk> => Boolean(chunk))
      .map((chunk) => ({
        chunkId: chunk.chunkId,
        documentId: chunk.documentId,
        documentTitle: chunk.documentTitle,
        chunkIndex: chunk.chunkIndex,
        excerpt: chunk.content.slice(0, 280),
      }));
    const decision = this.decideGroundedOutcome(groundedResponse.parsed, settings.confidenceThreshold);
    const now = new Date();
    const messageContent =
      groundedResponse.parsed.outcome === "FOLLOW_UP" && groundedResponse.parsed.followUpQuestions.length > 0
        ? `${groundedResponse.parsed.answer}\n\nFollow-up questions:\n- ${groundedResponse.parsed.followUpQuestions.join("\n- ")}`
        : groundedResponse.parsed.answer;
    const result = await this.aiAgentRepository.persistGroundedResponse({
      ticketId,
      organizationId,
      model: groundedResponse.model,
      promptVersion: RESPONSE_PROMPT_VERSION,
      structuredOutput: groundedResponse.parsed,
      retrievedChunks,
      citations,
      responseText: groundedResponse.rawText,
      confidenceScore: groundedResponse.parsed.confidenceScore,
      promptTokens: groundedResponse.usage.promptTokens,
      completionTokens: groundedResponse.usage.completionTokens,
      totalTokens: groundedResponse.usage.totalTokens,
      outcome: decision.outcome,
      escalated: decision.status === TicketStatus.ESCALATED,
      messageContent,
      ticketUpdate: {
        status: decision.status,
        priority: ticket.priority,
        resolutionSummary: this.buildGroundedSummary(groundedResponse.parsed),
        ...(decision.status === TicketStatus.RESOLVED ? { resolvedAt: now } : {}),
        ...(decision.status === TicketStatus.ESCALATED ? { escalatedAt: now } : {}),
      },
    });

    return {
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  private decideOutcome(
    parsed: Awaited<ReturnType<GeminiTriageService["triageTicket"]>>["parsed"],
    confidenceThreshold: number,
  ) {
    if (parsed.spamScore >= 0.8) {
      return {
        outcome: AiDecisionOutcome.SPAM_BLOCKED,
        status: TicketStatus.SPAM,
      };
    }

    if (parsed.duplicateScore >= 0.9) {
      return {
        outcome: AiDecisionOutcome.DUPLICATE_MATCHED,
        status: TicketStatus.IN_PROGRESS,
      };
    }

    if (parsed.urgencyScore >= 0.85 || parsed.priority === "URGENT" || parsed.priority === "CRITICAL") {
      return {
        outcome: AiDecisionOutcome.URGENT_ROUTING,
        status: TicketStatus.ESCALATED,
      };
    }

    if (parsed.needsFollowUp) {
      return {
        outcome: AiDecisionOutcome.FOLLOW_UP_REQUIRED,
        status: TicketStatus.WAITING_CUSTOMER,
      };
    }

    if (parsed.shouldEscalate || parsed.confidenceScore < confidenceThreshold) {
      return {
        outcome: AiDecisionOutcome.ESCALATED,
        status: TicketStatus.ESCALATED,
      };
    }

    return {
      outcome: AiDecisionOutcome.AUTO_RESOLVED,
      status: TicketStatus.RESOLVED,
    };
  }

  private buildSummary(parsed: Awaited<ReturnType<GeminiTriageService["triageTicket"]>>["parsed"]) {
    const followUp =
      parsed.followUpQuestions.length > 0 ? ` Follow-up: ${parsed.followUpQuestions.join(" ")}` : "";

    return `${parsed.summary} Rationale: ${parsed.rationale}.${followUp}`.trim();
  }

  private decideGroundedOutcome(
    parsed: Awaited<ReturnType<GeminiGroundedResponseService["generateResponse"]>>["parsed"],
    confidenceThreshold: number,
  ) {
    if (parsed.outcome === "FOLLOW_UP") {
      return {
        outcome: AiDecisionOutcome.FOLLOW_UP_REQUIRED,
        status: TicketStatus.WAITING_CUSTOMER,
      };
    }

    if (parsed.outcome === "ESCALATE" || parsed.confidenceScore < confidenceThreshold) {
      return {
        outcome: AiDecisionOutcome.ESCALATED,
        status: TicketStatus.ESCALATED,
      };
    }

    return {
      outcome: AiDecisionOutcome.AUTO_RESOLVED,
      status: TicketStatus.RESOLVED,
    };
  }

  private buildGroundedSummary(parsed: Awaited<ReturnType<GeminiGroundedResponseService["generateResponse"]>>["parsed"]) {
    const followUp =
      parsed.followUpQuestions.length > 0 ? ` Follow-up: ${parsed.followUpQuestions.join(" ")}` : "";

    return `${parsed.answer} Rationale: ${parsed.rationale}.${followUp}`.trim();
  }

  private extractKeywords(value: string) {
    return Array.from(
      new Set(
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((term) => term.length >= 4),
      ),
    ).slice(0, 8);
  }

  private requireOrganization(user: RequestUser) {
    if (!user.organizationId) {
      throw new ForbiddenException("User is not assigned to an organization.");
    }

    return user.organizationId;
  }
}

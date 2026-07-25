import type { AiDecisionOutcome, TicketPriority, TicketStatus } from "@prisma/client";

export type TriageTicketRecord = {
  id: string;
  organizationId: string;
  subject: string;
  description: string;
  requesterEmail: string;
  requesterName: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  languageCode: string | null;
  intentLabel: string | null;
  sentimentLabel: string | null;
  confidenceScore: number | null;
};

export type ResponseTicketRecord = TriageTicketRecord & {
  resolutionSummary: string | null;
};

export type RetrievedChunkRecord = {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  content: string;
};

export type PersistTriageResultParams = {
  ticketId: string;
  organizationId: string;
  model: string;
  promptVersion: string;
  structuredOutput: Record<string, unknown>;
  responseText: string;
  confidenceScore: number;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  outcome: AiDecisionOutcome;
  escalated: boolean;
  ticketUpdate: {
    status: TicketStatus;
    priority: TicketPriority;
    languageCode: string;
    intentLabel: string;
    sentimentLabel: string;
    spamScore: number;
    duplicateScore: number;
    urgencyScore: number;
    confidenceScore: number;
    resolutionSummary: string;
    resolvedAt?: Date;
    escalatedAt?: Date;
  };
};

export abstract class AiAgentRepository {
  abstract findTicketForTriage(organizationId: string, ticketId: string): Promise<TriageTicketRecord | null>;
  abstract findTicketForResponse(organizationId: string, ticketId: string): Promise<ResponseTicketRecord | null>;
  abstract retrieveKnowledgeChunks(params: {
    organizationId: string;
    query: string;
    keywords: string[];
    topK: number;
    queryEmbedding?: number[];
  }): Promise<RetrievedChunkRecord[]>;
  abstract persistTriageResult(params: PersistTriageResultParams): Promise<{
    ticket: {
      id: string;
      subject: string;
      description: string;
      requesterEmail: string;
      requesterName: string | null;
      status: TicketStatus;
      priority: TicketPriority;
      intentLabel: string | null;
      confidenceScore: number | null;
      languageCode: string | null;
      sentimentLabel: string | null;
      resolutionSummary: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    aiRun: {
      id: string;
      model: string;
      type: "TRIAGE";
      outcome: AiDecisionOutcome | null;
      confidenceScore: number | null;
      responseText: string | null;
      promptTokens: number | null;
      completionTokens: number | null;
      totalTokens: number | null;
      createdAt: Date;
    };
  }>;
  abstract persistGroundedResponse(params: {
    ticketId: string;
    organizationId: string;
    model: string;
    promptVersion: string;
    structuredOutput: Record<string, unknown>;
    retrievedChunks: RetrievedChunkRecord[];
    citations: Array<{
      chunkId: string;
      documentId: string;
      documentTitle: string;
      chunkIndex: number;
      excerpt: string;
    }>;
    responseText: string;
    confidenceScore: number;
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
    outcome: AiDecisionOutcome;
    escalated: boolean;
    messageContent: string;
    ticketUpdate: {
      status: TicketStatus;
      priority: TicketPriority;
      resolutionSummary: string;
      resolvedAt?: Date;
      escalatedAt?: Date;
    };
  }): Promise<{
    ticket: {
      id: string;
      subject: string;
      description: string;
      requesterEmail: string;
      requesterName: string | null;
      status: TicketStatus;
      priority: TicketPriority;
      intentLabel: string | null;
      confidenceScore: number | null;
      languageCode: string | null;
      sentimentLabel: string | null;
      resolutionSummary: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    aiRun: {
      id: string;
      model: string;
      type: "RESPONSE";
      outcome: AiDecisionOutcome | null;
      confidenceScore: number | null;
      responseText: string | null;
      promptTokens: number | null;
      completionTokens: number | null;
      totalTokens: number | null;
      createdAt: Date;
    };
    messages: Array<{
      id: string;
      authorType: "CUSTOMER" | "AGENT" | "OPERATOR" | "SYSTEM";
      content: string;
      citations: Array<{
        chunkId: string;
        documentId: string;
        documentTitle: string;
        chunkIndex: number;
        excerpt: string;
      }> | null;
      createdAt: Date;
    }>;
  }>;
}

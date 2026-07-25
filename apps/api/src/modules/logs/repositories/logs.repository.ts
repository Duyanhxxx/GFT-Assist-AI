import type { AiDecisionOutcome, AiRunType } from "@prisma/client";

export type AiRunLogItem = {
  id: string;
  ticketId: string;
  ticketSubject: string;
  type: AiRunType;
  model: string;
  promptVersion: string;
  outcome: AiDecisionOutcome | null;
  confidenceScore: number | null;
  latencyMs: number | null;
  totalTokens: number | null;
  escalated: boolean;
  createdAt: Date;
};

export abstract class LogsRepository {
  abstract listAiRuns(organizationId: string): Promise<AiRunLogItem[]>;
}

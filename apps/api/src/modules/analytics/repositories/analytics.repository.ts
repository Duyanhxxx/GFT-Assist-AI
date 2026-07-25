export type DashboardSummaryRecord = {
  totalTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  escalatedTickets: number;
  spamRate: number;
  averageConfidence: number;
  aiResolutionRate: number;
  knowledgeBaseUsage: number;
  humanOverrides: number;
  totalTokenUsage: number;
  averageLatencyMs: number;
};

export abstract class AnalyticsRepository {
  abstract getDashboardSummary(organizationId: string): Promise<DashboardSummaryRecord>;
}

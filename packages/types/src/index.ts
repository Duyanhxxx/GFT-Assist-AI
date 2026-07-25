export const APP_ROLES = ["ADMIN", "OPERATOR", "VIEWER"] as const;
export const TICKET_STATUSES = ["NEW", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "ESCALATED", "SPAM", "CLOSED"] as const;
export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"] as const;
export const KNOWLEDGE_SOURCE_TYPES = ["PDF", "DOCX", "TXT", "MARKDOWN"] as const;
export const DOCUMENT_STATUSES = ["PROCESSING", "READY", "FAILED", "ARCHIVED"] as const;
export const AI_DECISION_OUTCOMES = [
  "AUTO_RESOLVED",
  "FOLLOW_UP_REQUIRED",
  "ESCALATED",
  "URGENT_ROUTING",
  "SPAM_BLOCKED",
  "DUPLICATE_MATCHED",
] as const;

export type AppRole = (typeof APP_ROLES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type KnowledgeSourceType = (typeof KNOWLEDGE_SOURCE_TYPES)[number];
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
export type AiDecisionOutcome = (typeof AI_DECISION_OUTCOMES)[number];

export type AuthUser = {
  id: string;
  email: string;
  role: AppRole;
  organizationId?: string;
};

export type TicketListItem = {
  id: string;
  subject: string;
  requesterEmail: string;
  requesterName: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  intentLabel: string | null;
  confidenceScore: number | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketDetail = TicketListItem & {
  description: string;
  languageCode: string | null;
  sentimentLabel: string | null;
  resolutionSummary: string | null;
};

export type TicketCitation = {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  excerpt: string;
};

export type TicketMessage = {
  id: string;
  authorType: "CUSTOMER" | "AGENT" | "OPERATOR" | "SYSTEM";
  content: string;
  citations: TicketCitation[] | null;
  createdAt: string;
};

export type TicketListResponse = {
  data: TicketListItem[];
  meta: {
    nextCursor: string | null;
    timestamp: string;
  };
};

export type TicketDetailResponse = {
  data: {
    ticket: TicketDetail;
    messages: TicketMessage[];
  };
  meta: {
    timestamp: string;
  };
};

export type CreateTicketIntakeInput = {
  organizationSlug: string;
  subject: string;
  description: string;
  requesterEmail: string;
  requesterName?: string;
};

export type KnowledgeDocumentListItem = {
  id: string;
  title: string;
  sourceType: KnowledgeSourceType;
  status: DocumentStatus;
  mimeType: string;
  processedAt: string | null;
  createdAt: string;
  metadata: {
    chunkCount: number;
    characterCount: number;
    fileName: string;
    sizeBytes: number;
  } | null;
};

export type KnowledgeChunkPreview = {
  id: string;
  chunkIndex: number;
  content: string;
  tokenCount: number | null;
};

export type KnowledgeDocumentDetail = KnowledgeDocumentListItem & {
  storagePath: string;
  errorMessage: string | null;
  chunks: KnowledgeChunkPreview[];
};

export type KnowledgeDocumentListResponse = {
  data: KnowledgeDocumentListItem[];
  meta: {
    timestamp: string;
  };
};

export type KnowledgeDocumentDetailResponse = {
  data: KnowledgeDocumentDetail;
  meta: {
    timestamp: string;
  };
};

export type AiRunSummary = {
  id: string;
  model: string;
  type: "TRIAGE" | "RESPONSE" | "FOLLOW_UP" | "SUMMARY";
  outcome: AiDecisionOutcome | null;
  confidenceScore: number | null;
  responseText: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  createdAt: string;
};

export type TicketTriageResponse = {
  data: {
    ticket: TicketDetail;
    aiRun: AiRunSummary;
  };
  meta: {
    timestamp: string;
  };
};

export type TicketGroundedResponse = {
  data: {
    ticket: TicketDetail;
    aiRun: AiRunSummary;
    messages: TicketMessage[];
  };
  meta: {
    timestamp: string;
  };
};

export type DashboardSummary = {
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

export type DashboardSummaryResponse = {
  data: DashboardSummary;
  meta: {
    timestamp: string;
  };
};

export type AiRunListItem = {
  id: string;
  ticketId: string;
  ticketSubject: string;
  type: "TRIAGE" | "RESPONSE" | "FOLLOW_UP" | "SUMMARY";
  model: string;
  promptVersion: string;
  outcome: AiDecisionOutcome | null;
  confidenceScore: number | null;
  latencyMs: number | null;
  totalTokens: number | null;
  escalated: boolean;
  createdAt: string;
};

export type AiRunListResponse = {
  data: AiRunListItem[];
  meta: {
    timestamp: string;
  };
};

export type OrganizationSettings = {
  aiModel: string;
  temperature: number;
  confidenceThreshold: number;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  retrievalTopK: number;
  createdAt: string;
  updatedAt: string;
};

export type SettingsChangeItem = {
  id: string;
  action: string;
  actorType: "USER" | "SYSTEM" | "AI";
  actorEmail: string | null;
  createdAt: string;
};

export type OrganizationSettingsResponse = {
  data: {
    settings: OrganizationSettings;
    recentChanges: SettingsChangeItem[];
  };
  meta: {
    timestamp: string;
  };
};

export type UpdateOrganizationSettingsInput = {
  aiModel: string;
  temperature: number;
  confidenceThreshold: number;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  retrievalTopK: number;
};

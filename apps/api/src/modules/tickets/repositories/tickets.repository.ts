import type { TicketPriority, TicketStatus } from "@prisma/client";

export type TicketListItem = {
  id: string;
  subject: string;
  requesterEmail: string;
  requesterName: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  intentLabel: string | null;
  confidenceScore: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TicketDetail = TicketListItem & {
  description: string;
  languageCode: string | null;
  sentimentLabel: string | null;
  resolutionSummary: string | null;
};

export type TicketCitationRecord = {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  excerpt: string;
};

export type TicketMessageRecord = {
  id: string;
  authorType: "CUSTOMER" | "AGENT" | "OPERATOR" | "SYSTEM";
  content: string;
  citations: TicketCitationRecord[] | null;
  createdAt: Date;
};

export type TicketDetailView = {
  ticket: TicketDetail;
  messages: TicketMessageRecord[];
};

export type CreateTicketIntakeParams = {
  organizationId: string;
  subject: string;
  description: string;
  requesterEmail: string;
  requesterName?: string;
};

export type ListTicketsParams = {
  organizationId: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  limit: number;
  cursor?: string;
  search?: string;
};

export abstract class TicketsRepository {
  abstract findOrganizationIdBySlug(slug: string): Promise<string | null>;
  abstract createIntakeTicket(params: CreateTicketIntakeParams): Promise<TicketDetail>;
  abstract listTickets(params: ListTicketsParams): Promise<{
    items: TicketListItem[];
    nextCursor: string | null;
  }>;
  abstract findTicketById(organizationId: string, ticketId: string): Promise<TicketDetailView | null>;
}

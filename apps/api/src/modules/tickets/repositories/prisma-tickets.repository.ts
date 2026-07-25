import { Injectable } from "@nestjs/common";
import { TicketChannel, TicketPriority, TicketStatus, type Prisma } from "@prisma/client";

import { PrismaService } from "../../../infrastructure/prisma/prisma.service.js";
import {
  TicketsRepository,
  type CreateTicketIntakeParams,
  type TicketCitationRecord,
  type ListTicketsParams,
  type TicketDetail,
  type TicketDetailView,
  type TicketMessageRecord,
  type TicketListItem,
} from "./tickets.repository.js";

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
export class PrismaTicketsRepository extends TicketsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findOrganizationIdBySlug(slug: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    return organization?.id ?? null;
  }

  async createIntakeTicket(params: CreateTicketIntakeParams): Promise<TicketDetail> {
    return this.prisma.ticket.create({
      data: {
        organizationId: params.organizationId,
        channel: TicketChannel.WEB_FORM,
        status: TicketStatus.NEW,
        priority: TicketPriority.MEDIUM,
        subject: params.subject,
        description: params.description,
        requesterEmail: params.requesterEmail,
        ...(params.requesterName ? { requesterName: params.requesterName } : {}),
      },
      select: ticketSelect,
    });
  }

  async listTickets(params: ListTicketsParams) {
    const where: Prisma.TicketWhereInput = {
      organizationId: params.organizationId,
      ...(params.status ? { status: params.status } : {}),
      ...(params.priority ? { priority: params.priority } : {}),
      ...(params.search
        ? {
            OR: [
              { subject: { contains: params.search, mode: "insensitive" } },
              { requesterEmail: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const items = (await this.prisma.ticket.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: params.limit + 1,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        subject: true,
        requesterEmail: true,
        requesterName: true,
        status: true,
        priority: true,
        intentLabel: true,
        confidenceScore: true,
        createdAt: true,
        updatedAt: true,
      },
    })) as TicketListItem[];

    const hasMore = items.length > params.limit;
    const visibleItems = hasMore ? items.slice(0, params.limit) : items;

    return {
      items: visibleItems,
      nextCursor: hasMore ? visibleItems.at(-1)?.id ?? null : null,
    };
  }

  async findTicketById(organizationId: string, ticketId: string): Promise<TicketDetailView | null> {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        organizationId,
      },
      select: ticketSelect,
    });

    if (!ticket) {
      return null;
    }

    const messages = await this.prisma.ticketMessage.findMany({
      where: {
        ticketId,
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
      ticket: ticket as TicketDetail,
      messages: messages.map((message) => ({
        id: message.id,
        authorType: message.authorType,
        content: message.content,
        citations: Array.isArray(message.citations) ? (message.citations as TicketCitationRecord[]) : null,
        createdAt: message.createdAt,
      })) as TicketMessageRecord[],
    };
  }
}

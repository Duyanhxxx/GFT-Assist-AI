import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import type { RequestUser } from "../auth/types/request-user.type.js";
import { CreateTicketIntakeDto } from "./dto/create-ticket-intake.dto.js";
import { ListTicketsQueryDto } from "./dto/list-tickets-query.dto.js";
import { TicketsRepository } from "./repositories/tickets.repository.js";

@Injectable()
export class TicketsService {
  constructor(private readonly ticketsRepository: TicketsRepository) {}

  async createIntakeTicket(dto: CreateTicketIntakeDto) {
    const organizationId = await this.ticketsRepository.findOrganizationIdBySlug(dto.organizationSlug);

    if (!organizationId) {
      throw new NotFoundException("Organization not found.");
    }

    const ticket = await this.ticketsRepository.createIntakeTicket({
      organizationId,
      subject: dto.subject,
      description: dto.description,
      requesterEmail: dto.requesterEmail,
      ...(dto.requesterName ? { requesterName: dto.requesterName } : {}),
    });

    return {
      data: ticket,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  async listTickets(user: RequestUser, query: ListTicketsQueryDto) {
    const organizationId = this.requireOrganization(user);
    const result = await this.ticketsRepository.listTickets({
      organizationId,
      limit: query.limit,
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.cursor ? { cursor: query.cursor } : {}),
      ...(query.search ? { search: query.search } : {}),
    });

    return {
      data: result.items,
      meta: {
        nextCursor: result.nextCursor,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getTicket(user: RequestUser, ticketId: string) {
    const organizationId = this.requireOrganization(user);
    const detail = await this.ticketsRepository.findTicketById(organizationId, ticketId);

    if (!detail) {
      throw new NotFoundException("Ticket not found.");
    }

    return {
      data: detail,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  private requireOrganization(user: RequestUser) {
    if (!user.organizationId) {
      throw new ForbiddenException("User is not assigned to an organization.");
    }

    return user.organizationId;
  }
}

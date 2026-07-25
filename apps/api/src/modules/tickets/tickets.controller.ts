import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { RolesGuard } from "../auth/guards/roles.guard.js";
import { SupabaseJwtGuard } from "../auth/guards/supabase-jwt.guard.js";
import type { RequestUser } from "../auth/types/request-user.type.js";
import { CreateTicketIntakeDto } from "./dto/create-ticket-intake.dto.js";
import { ListTicketsQueryDto } from "./dto/list-tickets-query.dto.js";
import { TicketsService } from "./tickets.service.js";

@Controller("tickets")
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post("intake")
  createIntakeTicket(@Body() body: CreateTicketIntakeDto) {
    return this.ticketsService.createIntakeTicket(body);
  }

  @Get()
  @UseGuards(SupabaseJwtGuard, RolesGuard)
  @Roles("ADMIN", "OPERATOR", "VIEWER")
  listTickets(@CurrentUser() user: RequestUser, @Query() query: ListTicketsQueryDto) {
    return this.ticketsService.listTickets(user, query);
  }

  @Get(":ticketId")
  @UseGuards(SupabaseJwtGuard, RolesGuard)
  @Roles("ADMIN", "OPERATOR", "VIEWER")
  getTicket(@CurrentUser() user: RequestUser, @Param("ticketId") ticketId: string) {
    return this.ticketsService.getTicket(user, ticketId);
  }
}

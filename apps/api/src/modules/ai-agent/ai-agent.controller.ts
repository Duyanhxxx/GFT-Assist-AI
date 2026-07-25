import { Controller, Param, Post, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { RolesGuard } from "../auth/guards/roles.guard.js";
import { SupabaseJwtGuard } from "../auth/guards/supabase-jwt.guard.js";
import type { RequestUser } from "../auth/types/request-user.type.js";
import { AiAgentService } from "./ai-agent.service.js";

@Controller("ai")
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class AiAgentController {
  constructor(private readonly aiAgentService: AiAgentService) {}

  @Post("tickets/:ticketId/triage")
  @Roles("ADMIN", "OPERATOR")
  triageTicket(@CurrentUser() user: RequestUser, @Param("ticketId") ticketId: string) {
    return this.aiAgentService.triageTicket(user, ticketId);
  }

  @Post("tickets/:ticketId/respond")
  @Roles("ADMIN", "OPERATOR")
  generateGroundedResponse(@CurrentUser() user: RequestUser, @Param("ticketId") ticketId: string) {
    return this.aiAgentService.generateGroundedResponse(user, ticketId);
  }
}

import { Controller, Get, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { RolesGuard } from "../auth/guards/roles.guard.js";
import { SupabaseJwtGuard } from "../auth/guards/supabase-jwt.guard.js";
import type { RequestUser } from "../auth/types/request-user.type.js";
import { AnalyticsService } from "./analytics.service.js";

@Controller("dashboard")
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("summary")
  @Roles("ADMIN", "OPERATOR", "VIEWER")
  getDashboardSummary(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getDashboardSummary(user);
  }
}

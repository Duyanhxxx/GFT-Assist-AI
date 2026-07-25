import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { RolesGuard } from "../auth/guards/roles.guard.js";
import { SupabaseJwtGuard } from "../auth/guards/supabase-jwt.guard.js";
import type { RequestUser } from "../auth/types/request-user.type.js";
import { UpdateOrganizationSettingsDto } from "./dto/update-organization-settings.dto.js";
import { SettingsService } from "./settings.service.js";

@Controller("settings")
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles("ADMIN", "OPERATOR", "VIEWER")
  getSettings(@CurrentUser() user: RequestUser) {
    return this.settingsService.getSettings(user);
  }

  @Put()
  @Roles("ADMIN")
  updateSettings(@CurrentUser() user: RequestUser, @Body() body: UpdateOrganizationSettingsDto) {
    return this.settingsService.updateSettings(user, body);
  }
}

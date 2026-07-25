import { Controller, Get, UseGuards } from "@nestjs/common";

import { CurrentUser } from "./decorators/current-user.decorator.js";
import { Roles } from "./decorators/roles.decorator.js";
import { RolesGuard } from "./guards/roles.guard.js";
import { SupabaseJwtGuard } from "./guards/supabase-jwt.guard.js";
import type { RequestUser } from "./types/request-user.type.js";

@Controller("auth")
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class AuthController {
  @Get("me")
  @Roles("ADMIN", "OPERATOR", "VIEWER")
  getCurrentUser(@CurrentUser() user: RequestUser) {
    return {
      data: user,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}

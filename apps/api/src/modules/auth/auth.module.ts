import { Global, Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { RolesGuard } from "./guards/roles.guard.js";
import { SupabaseJwtGuard } from "./guards/supabase-jwt.guard.js";

@Global()
@Module({
  controllers: [AuthController],
  providers: [Reflector, AuthService, SupabaseJwtGuard, RolesGuard],
  exports: [AuthService, SupabaseJwtGuard, RolesGuard, Reflector],
})
export class AuthModule {}

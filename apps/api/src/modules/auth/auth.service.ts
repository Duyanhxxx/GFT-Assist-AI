import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { APP_ROLES, type AppRole } from "@gft-assist/types";

import type { RequestUser } from "./types/request-user.type.js";

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  async verifyAccessToken(token: string): Promise<RequestUser> {
    const jwksUrl = this.configService.get<string>("SUPABASE_JWKS_URL");
    const issuer = this.configService.get<string>("SUPABASE_JWT_ISSUER");
    const audience = this.configService.get<string>("SUPABASE_JWT_AUDIENCE", "authenticated");

    if (!jwksUrl || !issuer) {
      throw new UnauthorizedException("Supabase JWT verification is not configured.");
    }

    const jwks = createRemoteJWKSet(new URL(jwksUrl));
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience,
    });

    const id = typeof payload.sub === "string" ? payload.sub : undefined;
    const email = typeof payload.email === "string" ? payload.email : undefined;
    const appMetadata = this.asRecord(payload.app_metadata);
    const userMetadata = this.asRecord(payload.user_metadata);
    const roleCandidate = appMetadata.platform_role ?? userMetadata.platform_role ?? payload.role;
    const organizationId = appMetadata.organization_id;

    if (!id || !email) {
      throw new UnauthorizedException("Token payload is missing required claims.");
    }

    const role = this.isAppRole(roleCandidate) ? roleCandidate : "VIEWER";

    const user: RequestUser = {
      id,
      email,
      role,
    };

    if (typeof organizationId === "string") {
      user.organizationId = organizationId;
    }

    return user;
  }

  private isAppRole(value: unknown): value is AppRole {
    return typeof value === "string" && APP_ROLES.includes(value as AppRole);
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  }
}

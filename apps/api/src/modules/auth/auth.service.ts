import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MembershipStatus } from "@prisma/client";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { APP_ROLES, type AppRole } from "@gft-assist/types";

import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import type { RequestUser } from "./types/request-user.type.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

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
    const organizationId =
      appMetadata.organization_id ??
      userMetadata.organization_id ??
      appMetadata.organizationId ??
      userMetadata.organizationId ??
      appMetadata.org_id ??
      userMetadata.org_id;

    if (!id || !email) {
      throw new UnauthorizedException("Token payload is missing required claims.");
    }

    const membershipContext = await this.resolveMembershipContext(id, email);
    const role = this.isAppRole(roleCandidate)
      ? roleCandidate
      : membershipContext?.role ?? "VIEWER";

    const user: RequestUser = {
      id,
      email,
      role,
    };

    if (typeof organizationId === "string") {
      user.organizationId = organizationId;
    } else if (membershipContext?.organizationId) {
      user.organizationId = membershipContext.organizationId;
    }

    return user;
  }

  private async resolveMembershipContext(id: string, email: string) {
    const profile = await this.prisma.userProfile.findFirst({
      where: {
        OR: [{ supabaseUserId: id }, { email }],
      },
      select: {
        memberships: {
          where: {
            status: MembershipStatus.ACTIVE,
          },
          orderBy: {
            createdAt: "asc",
          },
          select: {
            role: true,
            organizationId: true,
          },
        },
      },
    });

    const membership = profile?.memberships[0];

    if (!membership || !this.isAppRole(membership.role)) {
      return null;
    }

    return {
      role: membership.role,
      organizationId: membership.organizationId,
    };
  }

  private isAppRole(value: unknown): value is AppRole {
    return typeof value === "string" && APP_ROLES.includes(value as AppRole);
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  }
}

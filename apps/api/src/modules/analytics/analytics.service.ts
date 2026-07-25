import { ForbiddenException, Injectable } from "@nestjs/common";

import type { RequestUser } from "../auth/types/request-user.type.js";
import { AnalyticsRepository } from "./repositories/analytics.repository.js";

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getDashboardSummary(user: RequestUser) {
    const organizationId = this.requireOrganization(user);
    const summary = await this.analyticsRepository.getDashboardSummary(organizationId);

    return {
      data: summary,
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

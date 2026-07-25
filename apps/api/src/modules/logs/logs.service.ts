import { ForbiddenException, Injectable } from "@nestjs/common";

import type { RequestUser } from "../auth/types/request-user.type.js";
import { LogsRepository } from "./repositories/logs.repository.js";

@Injectable()
export class LogsService {
  constructor(private readonly logsRepository: LogsRepository) {}

  async listAiRuns(user: RequestUser) {
    const organizationId = this.requireOrganization(user);
    const runs = await this.logsRepository.listAiRuns(organizationId);

    return {
      data: runs,
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

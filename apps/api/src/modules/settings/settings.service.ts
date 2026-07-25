import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuditActorType } from "@prisma/client";

import type { RequestUser } from "../auth/types/request-user.type.js";
import { UpdateOrganizationSettingsDto } from "./dto/update-organization-settings.dto.js";
import { SettingsRepository } from "./repositories/settings.repository.js";

const SETTINGS_CHANGE_LIMIT = 10;

@Injectable()
export class SettingsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly settingsRepository: SettingsRepository,
  ) {}

  async getSettings(user: RequestUser) {
    const organizationId = this.requireOrganization(user);
    const settings = await this.getSettingsForOrganization(organizationId);
    const recentChanges = await this.settingsRepository.listRecentSettingChanges(organizationId, SETTINGS_CHANGE_LIMIT);

    return {
      data: {
        settings: this.serializeSettings(settings),
        recentChanges: recentChanges.map((change) => ({
          id: change.id,
          action: change.action,
          actorType: change.actorType,
          actorEmail: change.actorEmail,
          createdAt: change.createdAt.toISOString(),
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  async updateSettings(user: RequestUser, dto: UpdateOrganizationSettingsDto) {
    const organizationId = this.requireOrganization(user);
    this.validate(dto);

    const settings = await this.settingsRepository.upsertOrganizationSettings({
      organizationId,
      values: {
        aiModel: dto.aiModel.trim(),
        temperature: dto.temperature,
        confidenceThreshold: dto.confidenceThreshold,
        embeddingModel: dto.embeddingModel.trim(),
        chunkSize: dto.chunkSize,
        chunkOverlap: dto.chunkOverlap,
        retrievalTopK: dto.retrievalTopK,
      },
      actor: {
        type: AuditActorType.USER,
        userEmail: user.email,
        userSupabaseId: user.id,
      },
    });
    const recentChanges = await this.settingsRepository.listRecentSettingChanges(organizationId, SETTINGS_CHANGE_LIMIT);

    return {
      data: {
        settings: this.serializeSettings(settings),
        recentChanges: recentChanges.map((change) => ({
          id: change.id,
          action: change.action,
          actorType: change.actorType,
          actorEmail: change.actorEmail,
          createdAt: change.createdAt.toISOString(),
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getSettingsForOrganization(organizationId: string) {
    const existing = await this.settingsRepository.findOrganizationSettings(organizationId);

    if (existing) {
      return existing;
    }

    return this.settingsRepository.upsertOrganizationSettings({
      organizationId,
      values: this.getDefaultValues(),
      actor: {
        type: AuditActorType.SYSTEM,
      },
    });
  }

  private getDefaultValues() {
    return {
      aiModel: this.configService.get<string>("GEMINI_MODEL", "gemini-2.5-flash"),
      temperature: 0.1,
      confidenceThreshold: 0.65,
      embeddingModel: this.configService.get<string>("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001"),
      chunkSize: 1200,
      chunkOverlap: 200,
      retrievalTopK: 5,
    };
  }

  private validate(dto: UpdateOrganizationSettingsDto) {
    if (!dto.aiModel.trim()) {
      throw new BadRequestException("AI model is required.");
    }

    if (!dto.embeddingModel.trim()) {
      throw new BadRequestException("Embedding model is required.");
    }

    if (dto.chunkOverlap >= dto.chunkSize) {
      throw new BadRequestException("Chunk overlap must be smaller than chunk size.");
    }
  }

  private serializeSettings(settings: Awaited<ReturnType<SettingsService["getSettingsForOrganization"]>>) {
    return {
      aiModel: settings.aiModel,
      temperature: settings.temperature,
      confidenceThreshold: settings.confidenceThreshold,
      embeddingModel: settings.embeddingModel,
      chunkSize: settings.chunkSize,
      chunkOverlap: settings.chunkOverlap,
      retrievalTopK: settings.retrievalTopK,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };
  }

  private requireOrganization(user: RequestUser) {
    if (!user.organizationId) {
      throw new ForbiddenException("User is not assigned to an organization.");
    }

    return user.organizationId;
  }
}

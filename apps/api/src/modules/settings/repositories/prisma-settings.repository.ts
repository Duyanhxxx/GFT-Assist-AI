import { Injectable } from "@nestjs/common";
import { Prisma, type AuditActorType } from "@prisma/client";

import { PrismaService } from "../../../infrastructure/prisma/prisma.service.js";
import {
  SettingsRepository,
  type OrganizationSettingsRecord,
  type UpsertOrganizationSettingsParams,
} from "./settings.repository.js";

const settingsSelect = {
  aiModel: true,
  temperature: true,
  confidenceThreshold: true,
  embeddingModel: true,
  chunkSize: true,
  chunkOverlap: true,
  retrievalTopK: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.OrganizationSettingsSelect;

@Injectable()
export class PrismaSettingsRepository extends SettingsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findOrganizationSettings(organizationId: string) {
    const settings = await this.prisma.organizationSettings.findUnique({
      where: {
        organizationId,
      },
      select: settingsSelect,
    });

    return settings ? this.mapSettings(settings) : null;
  }

  async upsertOrganizationSettings(params: UpsertOrganizationSettingsParams) {
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.organizationSettings.findUnique({
        where: {
          organizationId: params.organizationId,
        },
        select: settingsSelect,
      });

      const settings = await tx.organizationSettings.upsert({
        where: {
          organizationId: params.organizationId,
        },
        update: {
          aiModel: params.values.aiModel,
          temperature: new Prisma.Decimal(params.values.temperature),
          confidenceThreshold: new Prisma.Decimal(params.values.confidenceThreshold),
          embeddingModel: params.values.embeddingModel,
          chunkSize: params.values.chunkSize,
          chunkOverlap: params.values.chunkOverlap,
          retrievalTopK: params.values.retrievalTopK,
        },
        create: {
          organizationId: params.organizationId,
          aiModel: params.values.aiModel,
          temperature: new Prisma.Decimal(params.values.temperature),
          confidenceThreshold: new Prisma.Decimal(params.values.confidenceThreshold),
          embeddingModel: params.values.embeddingModel,
          chunkSize: params.values.chunkSize,
          chunkOverlap: params.values.chunkOverlap,
          retrievalTopK: params.values.retrievalTopK,
        },
        select: settingsSelect,
      });

      await tx.auditLog.create({
        data: {
          organizationId: params.organizationId,
          actorType: params.actor.type,
          entityType: "ORGANIZATION_SETTINGS",
          entityId: params.organizationId,
          action: previous ? "UPDATED" : "CREATED",
          ...(previous ? { beforeState: this.serializeSettings(previous) } : {}),
          afterState: this.serializeSettings(settings),
          metadata: {
            actorEmail: params.actor.userEmail ?? null,
            actorSupabaseId: params.actor.userSupabaseId ?? null,
          } as Prisma.InputJsonValue,
        },
      });

      return this.mapSettings(settings);
    });
  }

  async listRecentSettingChanges(organizationId: string, limit: number) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        organizationId,
        entityType: "ORGANIZATION_SETTINGS",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        action: true,
        actorType: true,
        createdAt: true,
        metadata: true,
      },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      actorType: log.actorType as AuditActorType,
      actorEmail: this.readActorEmail(log.metadata),
      createdAt: log.createdAt,
    }));
  }

  private mapSettings(settings: {
    aiModel: string;
    temperature: Prisma.Decimal;
    confidenceThreshold: Prisma.Decimal;
    embeddingModel: string;
    chunkSize: number;
    chunkOverlap: number;
    retrievalTopK: number;
    createdAt: Date;
    updatedAt: Date;
  }): OrganizationSettingsRecord {
    return {
      aiModel: settings.aiModel,
      temperature: settings.temperature.toNumber(),
      confidenceThreshold: settings.confidenceThreshold.toNumber(),
      embeddingModel: settings.embeddingModel,
      chunkSize: settings.chunkSize,
      chunkOverlap: settings.chunkOverlap,
      retrievalTopK: settings.retrievalTopK,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  private serializeSettings(settings: {
    aiModel: string;
    temperature: Prisma.Decimal;
    confidenceThreshold: Prisma.Decimal;
    embeddingModel: string;
    chunkSize: number;
    chunkOverlap: number;
    retrievalTopK: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      aiModel: settings.aiModel,
      temperature: settings.temperature.toNumber(),
      confidenceThreshold: settings.confidenceThreshold.toNumber(),
      embeddingModel: settings.embeddingModel,
      chunkSize: settings.chunkSize,
      chunkOverlap: settings.chunkOverlap,
      retrievalTopK: settings.retrievalTopK,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    } as Prisma.InputJsonValue;
  }

  private readActorEmail(metadata: unknown) {
    if (!metadata || typeof metadata !== "object") {
      return null;
    }

    const actorEmail = (metadata as Record<string, unknown>).actorEmail;

    return typeof actorEmail === "string" ? actorEmail : null;
  }
}

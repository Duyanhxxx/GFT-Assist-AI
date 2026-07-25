import type { AuditActorType } from "@prisma/client";

export type OrganizationSettingsRecord = {
  aiModel: string;
  temperature: number;
  confidenceThreshold: number;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  retrievalTopK: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SettingsChangeRecord = {
  id: string;
  action: string;
  actorType: AuditActorType;
  actorEmail: string | null;
  createdAt: Date;
};

export type UpsertOrganizationSettingsParams = {
  organizationId: string;
  values: {
    aiModel: string;
    temperature: number;
    confidenceThreshold: number;
    embeddingModel: string;
    chunkSize: number;
    chunkOverlap: number;
    retrievalTopK: number;
  };
  actor: {
    type: AuditActorType;
    userEmail?: string;
    userSupabaseId?: string;
  };
};

export abstract class SettingsRepository {
  abstract findOrganizationSettings(organizationId: string): Promise<OrganizationSettingsRecord | null>;
  abstract upsertOrganizationSettings(params: UpsertOrganizationSettingsParams): Promise<OrganizationSettingsRecord>;
  abstract listRecentSettingChanges(organizationId: string, limit: number): Promise<SettingsChangeRecord[]>;
}

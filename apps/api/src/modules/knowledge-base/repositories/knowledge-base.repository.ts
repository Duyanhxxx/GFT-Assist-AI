import type { DocumentStatus, KnowledgeSourceType } from "@prisma/client";

export type KnowledgeDocumentListItem = {
  id: string;
  title: string;
  sourceType: KnowledgeSourceType;
  status: DocumentStatus;
  mimeType: string;
  processedAt: Date | null;
  createdAt: Date;
  metadata: unknown;
};

export type KnowledgeChunkRecord = {
  id: string;
  chunkIndex: number;
  content: string;
  tokenCount: number | null;
};

export type KnowledgeDocumentDetail = KnowledgeDocumentListItem & {
  storagePath: string;
  errorMessage: string | null;
  chunks: KnowledgeChunkRecord[];
};

export type CreateKnowledgeDocumentParams = {
  organizationId: string;
  uploadedById?: string;
  title: string;
  sourceType: KnowledgeSourceType;
  checksum: string;
  storageBucket: string;
  storagePath: string;
  mimeType: string;
  metadata: Record<string, unknown>;
  chunks: Array<{
    chunkIndex: number;
    content: string;
    tokenCount: number | null;
    metadata: Record<string, unknown>;
  }>;
};

export abstract class KnowledgeBaseRepository {
  abstract findDocumentByChecksum(organizationId: string, checksum: string): Promise<KnowledgeDocumentListItem | null>;
  abstract createDocument(params: CreateKnowledgeDocumentParams): Promise<KnowledgeDocumentDetail>;
  abstract assignChunkEmbeddings(params: {
    documentId: string;
    embeddings: Array<{
      chunkId: string;
      values: number[];
    }>;
  }): Promise<void>;
  abstract listDocuments(organizationId: string): Promise<KnowledgeDocumentListItem[]>;
  abstract findDocumentById(organizationId: string, documentId: string): Promise<KnowledgeDocumentDetail | null>;
}

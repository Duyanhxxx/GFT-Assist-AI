import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { createHash } from "node:crypto";

import { GeminiEmbeddingService } from "../../infrastructure/ai/gemini-embedding.service.js";
import { StorageService } from "../../infrastructure/storage/storage.service.js";
import type { RequestUser } from "../auth/types/request-user.type.js";
import { SettingsService } from "../settings/settings.service.js";
import { ChunkingService } from "./services/chunking.service.js";
import { DocumentParserService } from "./services/document-parser.service.js";
import { KnowledgeBaseRepository } from "./repositories/knowledge-base.repository.js";

@Injectable()
export class KnowledgeBaseService {
  constructor(
    private readonly embeddingService: GeminiEmbeddingService,
    private readonly storageService: StorageService,
    private readonly parserService: DocumentParserService,
    private readonly chunkingService: ChunkingService,
    private readonly knowledgeBaseRepository: KnowledgeBaseRepository,
    private readonly settingsService: SettingsService,
  ) {}

  async uploadDocument(user: RequestUser, file: Express.Multer.File) {
    const organizationId = this.requireOrganization(user);
    const parsed = await this.parserService.parse(file);
    const checksum = createHash("sha256").update(file.buffer).digest("hex");
    const existing = await this.knowledgeBaseRepository.findDocumentByChecksum(organizationId, checksum);
    const settings = await this.settingsService.getSettingsForOrganization(organizationId);

    if (existing) {
      throw new ConflictException("This document already exists in the knowledge base.");
    }

    const chunks = this.chunkingService.chunk(parsed.text, {
      chunkSize: settings.chunkSize,
      chunkOverlap: settings.chunkOverlap,
    });
    const uploadedFile = await this.storageService.uploadKnowledgeFile({
      organizationId,
      fileName: file.originalname,
      contentType: file.mimetype,
      buffer: file.buffer,
    });
    const title = file.originalname.replace(/\.[^.]+$/, "");
    const document = await this.knowledgeBaseRepository.createDocument({
      organizationId,
      title,
      sourceType: parsed.sourceType,
      checksum,
      storageBucket: uploadedFile.bucket,
      storagePath: uploadedFile.path,
      mimeType: file.mimetype,
      metadata: {
        fileName: file.originalname,
        sizeBytes: file.size,
        chunkCount: chunks.length,
        characterCount: parsed.text.length,
      },
      chunks,
    });

    try {
      const embeddings = await this.embeddingService.embedTexts(
        document.chunks.map((chunk) => chunk.content),
        settings.embeddingModel,
      );

      if (embeddings.length === document.chunks.length) {
        await this.knowledgeBaseRepository.assignChunkEmbeddings({
          documentId: document.id,
          embeddings: document.chunks.map((chunk, index) => ({
            chunkId: chunk.id,
            values: embeddings[index] ?? [],
          })),
        });
      }
    } catch {
      // Keep the document available for lexical retrieval even if vector indexing is unavailable.
    }

    return {
      data: document,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  async listDocuments(user: RequestUser) {
    const organizationId = this.requireOrganization(user);
    const documents = await this.knowledgeBaseRepository.listDocuments(organizationId);

    return {
      data: documents,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getDocument(user: RequestUser, documentId: string) {
    const organizationId = this.requireOrganization(user);
    const document = await this.knowledgeBaseRepository.findDocumentById(organizationId, documentId);

    if (!document) {
      throw new NotFoundException("Knowledge document not found.");
    }

    return {
      data: document,
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

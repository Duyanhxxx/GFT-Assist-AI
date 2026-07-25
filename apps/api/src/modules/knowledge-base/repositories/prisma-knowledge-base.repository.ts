import { DocumentStatus, type Prisma } from "@prisma/client";
import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../../infrastructure/prisma/prisma.service.js";
import {
  KnowledgeBaseRepository,
  type CreateKnowledgeDocumentParams,
} from "./knowledge-base.repository.js";

const documentSelect = {
  id: true,
  title: true,
  sourceType: true,
  status: true,
  mimeType: true,
  processedAt: true,
  createdAt: true,
  metadata: true,
} satisfies Prisma.KnowledgeDocumentSelect;

@Injectable()
export class PrismaKnowledgeBaseRepository extends KnowledgeBaseRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findDocumentByChecksum(organizationId: string, checksum: string) {
    return this.prisma.knowledgeDocument.findFirst({
      where: {
        organizationId,
        checksum,
      },
      select: documentSelect,
    });
  }

  async createDocument(params: CreateKnowledgeDocumentParams) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.knowledgeDocument.create({
        data: {
          organizationId: params.organizationId,
          ...(params.uploadedById ? { uploadedById: params.uploadedById } : {}),
          title: params.title,
          sourceType: params.sourceType,
          status: DocumentStatus.READY,
          checksum: params.checksum,
          storageBucket: params.storageBucket,
          storagePath: params.storagePath,
          mimeType: params.mimeType,
          metadata: params.metadata as Prisma.InputJsonValue,
          processedAt: new Date(),
        },
        select: {
          id: true,
        },
      });

      await tx.knowledgeChunk.createMany({
        data: params.chunks.map((chunk) => ({
          organizationId: params.organizationId,
          documentId: created.id,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          tokenCount: chunk.tokenCount,
          metadata: chunk.metadata as Prisma.InputJsonValue,
        })),
      });

      return tx.knowledgeDocument.findFirstOrThrow({
        where: {
          id: created.id,
          organizationId: params.organizationId,
        },
        select: {
          ...documentSelect,
          storagePath: true,
          errorMessage: true,
          chunks: {
            orderBy: {
              chunkIndex: "asc",
            },
            select: {
              id: true,
              chunkIndex: true,
              content: true,
              tokenCount: true,
            },
          },
        },
      });
    });
  }

  async assignChunkEmbeddings(params: {
    documentId: string;
    embeddings: Array<{
      chunkId: string;
      values: number[];
    }>;
  }) {
    await this.prisma.$transaction(async (tx) => {
      for (const embedding of params.embeddings) {
        const vectorLiteral = `[${embedding.values.join(",")}]`;

        await tx.$executeRawUnsafe(
          'UPDATE "KnowledgeChunk" SET embedding = CAST($1 AS vector) WHERE id = $2 AND "documentId" = $3',
          vectorLiteral,
          embedding.chunkId,
          params.documentId,
        );
      }
    });
  }

  async listDocuments(organizationId: string) {
    return this.prisma.knowledgeDocument.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: documentSelect,
    });
  }

  async findDocumentById(organizationId: string, documentId: string) {
    return this.prisma.knowledgeDocument.findFirst({
      where: {
        id: documentId,
        organizationId,
      },
      select: {
        ...documentSelect,
        storagePath: true,
        errorMessage: true,
        chunks: {
          orderBy: {
            chunkIndex: "asc",
          },
          take: 20,
          select: {
            id: true,
            chunkIndex: true,
            content: true,
            tokenCount: true,
          },
        },
      },
    });
  }
}

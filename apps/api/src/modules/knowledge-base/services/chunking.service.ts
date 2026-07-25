import { Injectable } from "@nestjs/common";

type Chunk = {
  chunkIndex: number;
  content: string;
  tokenCount: number | null;
  metadata: Record<string, unknown>;
};

@Injectable()
export class ChunkingService {
  chunk(text: string, options?: { chunkSize?: number; chunkOverlap?: number }): Chunk[] {
    const chunkSize = options?.chunkSize ?? 1200;
    const chunkOverlap = options?.chunkOverlap ?? 200;
    const chunks: Chunk[] = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const slice = this.trimChunk(text.slice(start, end));

      if (slice) {
        chunks.push({
          chunkIndex,
          content: slice,
          tokenCount: this.estimateTokens(slice),
          metadata: {
            startOffset: start,
            endOffset: end,
          },
        });
        chunkIndex += 1;
      }

      if (end >= text.length) {
        break;
      }

      start = Math.max(end - chunkOverlap, start + 1);
    }

    return chunks;
  }

  private trimChunk(value: string) {
    return value.trim();
  }

  private estimateTokens(value: string) {
    return Math.ceil(value.length / 4);
  }
}

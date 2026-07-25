import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";

const EMBEDDING_DIMENSION = 1536;

@Injectable()
export class GeminiEmbeddingService {
  constructor(private readonly configService: ConfigService) {}

  async embedTexts(texts: string[], modelOverride?: string) {
    const filteredTexts = texts.map((text) => text.trim()).filter(Boolean);

    if (filteredTexts.length === 0) {
      return [];
    }

    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    const model = modelOverride || this.configService.get<string>("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001");

    if (!apiKey) {
      throw new ServiceUnavailableException("Gemini API is not configured.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.embedContent({
      model,
      contents: filteredTexts,
      config: {
        outputDimensionality: EMBEDDING_DIMENSION,
      },
    });

    return (response.embeddings ?? []).map((embedding) => this.normalizeDimension(embedding.values ?? []));
  }

  private normalizeDimension(values: number[]) {
    if (values.length === EMBEDDING_DIMENSION) {
      return values;
    }

    if (values.length > EMBEDDING_DIMENSION) {
      return values.slice(0, EMBEDDING_DIMENSION);
    }

    return [...values, ...new Array(EMBEDDING_DIMENSION - values.length).fill(0)];
  }
}

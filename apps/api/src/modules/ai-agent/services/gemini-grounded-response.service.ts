import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";

import type { RetrievedChunkRecord, ResponseTicketRecord } from "../repositories/ai-agent.repository.js";

export type GeminiGroundedResponseResult = {
  outcome: "ANSWER" | "FOLLOW_UP" | "ESCALATE";
  confidenceScore: number;
  answer: string;
  followUpQuestions: string[];
  rationale: string;
  citationChunkIds: string[];
};

const responseSchema = {
  type: "object",
  required: ["outcome", "confidenceScore", "answer", "followUpQuestions", "rationale", "citationChunkIds"],
  properties: {
    outcome: {
      type: "string",
      enum: ["ANSWER", "FOLLOW_UP", "ESCALATE"],
    },
    confidenceScore: { type: "number" },
    answer: { type: "string" },
    followUpQuestions: {
      type: "array",
      items: { type: "string" },
    },
    rationale: { type: "string" },
    citationChunkIds: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;

@Injectable()
export class GeminiGroundedResponseService {
  constructor(private readonly configService: ConfigService) {}

  async generateResponse(
    ticket: ResponseTicketRecord,
    chunks: RetrievedChunkRecord[],
    options?: {
      model?: string;
      temperature?: number;
      confidenceThreshold?: number;
    },
  ) {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    const model = options?.model || this.configService.get<string>("GEMINI_MODEL", "gemini-2.5-flash");

    if (!apiKey) {
      throw new ServiceUnavailableException("Gemini API is not configured.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                ticket: {
                  subject: ticket.subject,
                  description: ticket.description,
                  intentLabel: ticket.intentLabel,
                  languageCode: ticket.languageCode,
                },
                retrievedChunks: chunks.map((chunk) => ({
                  chunkId: chunk.chunkId,
                  documentId: chunk.documentId,
                  documentTitle: chunk.documentTitle,
                  chunkIndex: chunk.chunkIndex,
                  content: chunk.content,
                })),
                policy: {
                  escalationThreshold: options?.confidenceThreshold ?? 0.65,
                  instruction:
                    "Answer only from retrieved chunks. If the chunks do not support a reliable answer, choose FOLLOW_UP or ESCALATE. Cite only chunk IDs from the provided context.",
                },
              }),
            },
          ],
        },
      ],
      config: {
        temperature: options?.temperature ?? 0.1,
        responseMimeType: "application/json",
        responseJsonSchema: responseSchema,
        systemInstruction:
          "You are a grounded support response engine. Never invent facts beyond the retrieved chunks. Produce strict JSON only.",
      },
    });

    const text = response.text;

    if (!text) {
      throw new ServiceUnavailableException("Gemini returned an empty grounded response.");
    }

    return {
      model,
      parsed: this.parseResult(text, chunks),
      rawText: text,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount ?? null,
        completionTokens: response.usageMetadata?.candidatesTokenCount ?? null,
        totalTokens: response.usageMetadata?.totalTokenCount ?? null,
      },
    };
  }

  private parseResult(value: string, chunks: RetrievedChunkRecord[]): GeminiGroundedResponseResult {
    const validChunkIds = new Set(chunks.map((chunk) => chunk.chunkId));
    const parsed = JSON.parse(value) as Partial<GeminiGroundedResponseResult>;

    return {
      outcome: parsed.outcome === "FOLLOW_UP" || parsed.outcome === "ESCALATE" ? parsed.outcome : "ANSWER",
      confidenceScore: this.asScore(parsed.confidenceScore),
      answer: this.asString(parsed.answer, "I could not produce a grounded answer."),
      followUpQuestions: Array.isArray(parsed.followUpQuestions)
        ? parsed.followUpQuestions.filter((item): item is string => typeof item === "string")
        : [],
      rationale: this.asString(parsed.rationale, "No rationale provided."),
      citationChunkIds: Array.isArray(parsed.citationChunkIds)
        ? parsed.citationChunkIds.filter((item): item is string => typeof item === "string" && validChunkIds.has(item))
        : [],
    };
  }

  private asString(value: unknown, fallback: string) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  private asScore(value: unknown) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return 0;
    }

    return Math.min(1, Math.max(0, value));
  }
}

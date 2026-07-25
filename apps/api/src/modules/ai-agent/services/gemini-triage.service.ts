import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";

import type { TriageTicketRecord } from "../repositories/ai-agent.repository.js";

export type GeminiTriageResult = {
  languageCode: string;
  intentLabel: string;
  sentimentLabel: string;
  spamScore: number;
  duplicateScore: number;
  urgencyScore: number;
  confidenceScore: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
  needsFollowUp: boolean;
  shouldEscalate: boolean;
  followUpQuestions: string[];
  summary: string;
  rationale: string;
};

const triageSchema = {
  type: "object",
  required: [
    "languageCode",
    "intentLabel",
    "sentimentLabel",
    "spamScore",
    "duplicateScore",
    "urgencyScore",
    "confidenceScore",
    "priority",
    "needsFollowUp",
    "shouldEscalate",
    "followUpQuestions",
    "summary",
    "rationale",
  ],
  properties: {
    languageCode: { type: "string" },
    intentLabel: { type: "string" },
    sentimentLabel: { type: "string" },
    spamScore: { type: "number" },
    duplicateScore: { type: "number" },
    urgencyScore: { type: "number" },
    confidenceScore: { type: "number" },
    priority: {
      type: "string",
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"],
    },
    needsFollowUp: { type: "boolean" },
    shouldEscalate: { type: "boolean" },
    followUpQuestions: {
      type: "array",
      items: { type: "string" },
    },
    summary: { type: "string" },
    rationale: { type: "string" },
  },
} as const;

@Injectable()
export class GeminiTriageService {
  constructor(private readonly configService: ConfigService) {}

  async triageTicket(
    ticket: TriageTicketRecord,
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
                  requesterEmail: ticket.requesterEmail,
                  requesterName: ticket.requesterName,
                },
                policy: {
                  spamThreshold: 0.8,
                  escalationThreshold: options?.confidenceThreshold ?? 0.65,
                  urgentThreshold: 0.85,
                  instruction:
                    "Return a strict JSON triage decision for a support platform. Prefer escalation when confidence is low. Ask follow-up questions only when information is materially missing.",
                },
              }),
            },
          ],
        },
      ],
      config: {
        temperature: options?.temperature ?? 0.1,
        responseMimeType: "application/json",
        responseJsonSchema: triageSchema,
        systemInstruction:
          "You are an AI support triage engine. Classify the ticket, estimate scores from 0 to 1, decide if follow-up is required, and provide a concise rationale. Do not output markdown.",
      },
    });

    const text = response.text;

    if (!text) {
      throw new ServiceUnavailableException("Gemini returned an empty triage response.");
    }

    return {
      model,
      parsed: this.parseResult(text),
      rawText: text,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount ?? null,
        completionTokens: response.usageMetadata?.candidatesTokenCount ?? null,
        totalTokens: response.usageMetadata?.totalTokenCount ?? null,
      },
    };
  }

  private parseResult(value: string): GeminiTriageResult {
    const parsed = JSON.parse(value) as Partial<GeminiTriageResult>;

    return {
      languageCode: this.asString(parsed.languageCode, "unknown"),
      intentLabel: this.asString(parsed.intentLabel, "general_support"),
      sentimentLabel: this.asString(parsed.sentimentLabel, "neutral"),
      spamScore: this.asScore(parsed.spamScore),
      duplicateScore: this.asScore(parsed.duplicateScore),
      urgencyScore: this.asScore(parsed.urgencyScore),
      confidenceScore: this.asScore(parsed.confidenceScore),
      priority: this.asPriority(parsed.priority),
      needsFollowUp: Boolean(parsed.needsFollowUp),
      shouldEscalate: Boolean(parsed.shouldEscalate),
      followUpQuestions: Array.isArray(parsed.followUpQuestions)
        ? parsed.followUpQuestions.filter((item): item is string => typeof item === "string")
        : [],
      summary: this.asString(parsed.summary, "Ticket triaged by Gemini."),
      rationale: this.asString(parsed.rationale, "No rationale provided."),
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

  private asPriority(value: unknown): GeminiTriageResult["priority"] {
    return value === "LOW" || value === "MEDIUM" || value === "HIGH" || value === "URGENT" || value === "CRITICAL"
      ? value
      : "MEDIUM";
  }
}

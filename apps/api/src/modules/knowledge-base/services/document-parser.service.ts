import { BadRequestException, Injectable } from "@nestjs/common";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { KnowledgeSourceType } from "@prisma/client";

@Injectable()
export class DocumentParserService {
  async parse(file: Express.Multer.File) {
    const sourceType = this.resolveSourceType(file);
    const text = await this.extractText(file, sourceType);
    const normalizedText = this.normalize(text);

    if (!normalizedText) {
      throw new BadRequestException("Uploaded document does not contain extractable text.");
    }

    return {
      sourceType,
      text: normalizedText,
    };
  }

  private resolveSourceType(file: Express.Multer.File) {
    const extension = file.originalname.split(".").pop()?.toLowerCase();

    if (file.mimetype === "application/pdf" || extension === "pdf") {
      return KnowledgeSourceType.PDF;
    }

    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      extension === "docx"
    ) {
      return KnowledgeSourceType.DOCX;
    }

    if (file.mimetype === "text/markdown" || extension === "md" || extension === "markdown") {
      return KnowledgeSourceType.MARKDOWN;
    }

    if (file.mimetype.startsWith("text/") || extension === "txt") {
      return KnowledgeSourceType.TXT;
    }

    throw new BadRequestException("Unsupported document type.");
  }

  private async extractText(file: Express.Multer.File, sourceType: KnowledgeSourceType) {
    switch (sourceType) {
      case KnowledgeSourceType.PDF: {
        const result = await pdfParse(file.buffer);

        return result.text;
      }
      case KnowledgeSourceType.DOCX: {
        const result = await mammoth.extractRawText({
          buffer: file.buffer,
        });

        return result.value;
      }
      case KnowledgeSourceType.MARKDOWN:
      case KnowledgeSourceType.TXT:
        return file.buffer.toString("utf8");
      default:
        throw new BadRequestException("Unsupported document type.");
    }
  }

  private normalize(value: string) {
    return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }
}

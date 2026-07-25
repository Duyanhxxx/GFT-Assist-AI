declare module "express" {
  export interface Request {
    headers: Record<string, string | undefined>;
    [key: string]: unknown;
  }
}

declare namespace Express {
  namespace Multer {
    interface File {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    }
  }
}

declare module "pdf-parse" {
  type PdfParseResult = {
    text: string;
  };

  export default function pdfParse(dataBuffer: Buffer | Uint8Array): Promise<PdfParseResult>;
}

import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js";

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}

  async uploadKnowledgeFile(params: {
    organizationId: string;
    fileName: string;
    contentType: string;
    buffer: Buffer;
  }) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const serviceRoleKey = this.configService.get<string>("SUPABASE_SERVICE_ROLE_KEY");
    const bucket = this.configService.get<string>("SUPABASE_STORAGE_BUCKET_KB", "knowledge-base");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new ServiceUnavailableException("Supabase storage is not configured.");
    }

    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    const storagePath = `${params.organizationId}/${Date.now()}-${this.sanitizeFileName(params.fileName)}`;
    const { error } = await client.storage.from(bucket).upload(storagePath, params.buffer, {
      contentType: params.contentType,
      upsert: false,
    });

    if (error) {
      throw new ServiceUnavailableException(error.message);
    }

    return {
      bucket,
      path: storagePath,
    };
  }

  private sanitizeFileName(fileName: string) {
    return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
  }
}

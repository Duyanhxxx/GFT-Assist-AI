import { BadRequestException, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { RolesGuard } from "../auth/guards/roles.guard.js";
import { SupabaseJwtGuard } from "../auth/guards/supabase-jwt.guard.js";
import type { RequestUser } from "../auth/types/request-user.type.js";
import { KnowledgeBaseService } from "./knowledge-base.service.js";

@Controller("knowledge-documents")
@UseGuards(SupabaseJwtGuard, RolesGuard)
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Get()
  @Roles("ADMIN", "OPERATOR", "VIEWER")
  listDocuments(@CurrentUser() user: RequestUser) {
    return this.knowledgeBaseService.listDocuments(user);
  }

  @Get(":documentId")
  @Roles("ADMIN", "OPERATOR", "VIEWER")
  getDocument(@CurrentUser() user: RequestUser, @Param("documentId") documentId: string) {
    return this.knowledgeBaseService.getDocument(user, documentId);
  }

  @Post("upload")
  @Roles("ADMIN", "OPERATOR")
  @UseInterceptors(FileInterceptor("file"))
  uploadDocument(@CurrentUser() user: RequestUser, @UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException("Missing uploaded file.");
    }

    return this.knowledgeBaseService.uploadDocument(user, file);
  }
}

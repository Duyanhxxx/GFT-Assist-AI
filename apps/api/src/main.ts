import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { createRequire } from "node:module";

import { AppModule } from "./app.module.js";

const require = createRequire(import.meta.url);
const helmet = require("helmet") as typeof import("helmet").default;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>("API_PORT", 4000);
  const corsOrigin = configService.get<string>("API_CORS_ORIGIN", "http://localhost:3000");

  app.setGlobalPrefix("api/v1");
  app.use(helmet());
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  await app.listen(port);
}

void bootstrap();

import { Transform } from "class-transformer";
import { IsInt, IsNumber, IsString, Max, MaxLength, Min } from "class-validator";

export class UpdateOrganizationSettingsDto {
  @IsString()
  @MaxLength(120)
  aiModel!: string;

  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(2)
  temperature!: number;

  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(1)
  confidenceThreshold!: number;

  @IsString()
  @MaxLength(120)
  embeddingModel!: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(200)
  @Max(4000)
  chunkSize!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @Max(2000)
  chunkOverlap!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(20)
  retrievalTopK!: number;
}

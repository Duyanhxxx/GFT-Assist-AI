import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateTicketIntakeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  organizationSlug!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(240)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  description!: string;

  @IsEmail()
  requesterEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  requesterName?: string;
}

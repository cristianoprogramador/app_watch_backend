// src\website-monitoring\dto\website-monitoring.dto.ts
import { IsOptional, IsString, IsUrl } from "class-validator";

export class CheckWebsiteDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  token?: string;
}

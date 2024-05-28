// src/website-monitoring/dto/check-website.dto.ts
import { IsOptional, IsString, IsUrl } from "class-validator";

export class CheckWebsiteDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  token?: string;
}

// src/website-monitoring/dto/create-website.dto.ts
import {
  IsString,
  IsUrl,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { CreateRouteDto } from "./create-route.dto";

export class CreateWebsiteDto {
  @ApiProperty({ example: "google", description: "Nome do site" })
  @IsString()
  siteName: string;

  @ApiProperty({
    example: "https://api.chucknorris.io/",
    description: "URL do site",
  })
  @IsUrl()
  siteUrl: string;

  @ApiProperty({
    example: "aosidjo1i2j31oiwkjdo",
    description: "Token de autorização",
    required: false,
  })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiProperty({ example: "user-uuid", description: "ID do usuário" })
  @IsString()
  userId: string;

  @ApiProperty({
    type: [CreateRouteDto],
    description: "Rotas associadas ao site",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteDto)
  routes: CreateRouteDto[];
}

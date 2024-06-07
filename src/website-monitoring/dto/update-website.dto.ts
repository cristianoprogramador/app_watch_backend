// src\website-monitoring\dto\update-website.dto.ts

import { PartialType, ApiPropertyOptional, OmitType } from "@nestjs/swagger";
import { CreateWebsiteDto } from "./create-website.dto";
import { Type } from "class-transformer";
import { ValidateNested, IsOptional, IsArray } from "class-validator";
import { UpdateRouteDto } from "./update-route.dto";

export class UpdateWebsiteDto extends PartialType(
  OmitType(CreateWebsiteDto, ["userId"] as const)
) {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateRouteDto)
  @ApiPropertyOptional({
    type: [UpdateRouteDto],
    description:
      "Rotas associadas ao site para serem atualizadas ou adicionadas",
  })
  routes?: UpdateRouteDto[];
}

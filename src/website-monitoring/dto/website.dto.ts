// src/website-monitoring/dto/website.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class WebsiteDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;
}

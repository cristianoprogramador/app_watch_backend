// src/website-monitoring/dto/website-status.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class WebsiteStatusDto {
  @ApiProperty({ example: "online", description: "Status do site" })
  status: string;
}

// src\website-monitoring\dto\paginated-website.dto.ts

import { ApiProperty } from "@nestjs/swagger";
import { WebsiteDto } from "./website.dto";

export class PaginatedWebsiteDto {
  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: [WebsiteDto] })
  websites: WebsiteDto[];
}

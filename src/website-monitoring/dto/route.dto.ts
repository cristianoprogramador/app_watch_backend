// src/website-monitoring/dto/route.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class RouteDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  route: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  websiteId: string;

  @ApiProperty()
  websiteName: string;

  @ApiProperty()
  userEmail: string;
}

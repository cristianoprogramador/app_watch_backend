// src/website-monitoring/dto/paginated-route.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { RouteDto } from "./route.dto";

export class PaginatedRouteDto {
  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: [RouteDto] })
  routes: RouteDto[];
}

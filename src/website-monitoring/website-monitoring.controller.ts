// src/website-monitoring/website-monitoring.controller.ts
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiQuery, ApiTags, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { WebsiteMonitoringService } from "./website-monitoring.service";
import { WebsiteStatusDto } from "./dto/website-status.dto";
import { CheckWebsiteDto } from "./dto/website-monitoring.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@ApiTags("Website Monitoring")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller("website-monitoring")
export class WebsiteMonitoringController {
  constructor(
    private readonly websiteMonitoringService: WebsiteMonitoringService
  ) {}

  @Get("check")
  @ApiQuery({ name: "url", type: String, required: true })
  @ApiQuery({ name: "token", type: String, required: false })
  @ApiResponse({
    status: 200,
    description: "Status do site",
    type: WebsiteStatusDto,
  })
  @ApiResponse({ status: 400, description: "Parâmetros inválidos" })
  @ApiResponse({ status: 500, description: "Erro no servidor" })
  async checkWebsite(
    @Query() query: CheckWebsiteDto
  ): Promise<WebsiteStatusDto> {
    const { url, token } = query;
    return this.websiteMonitoringService.checkWebsite(url, token);
  }
}

// src/website-monitoring/website-monitoring.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiQuery,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { WebsiteMonitoringService } from "./website-monitoring.service";
import { WebsiteStatusDto } from "./dto/website-status.dto";
import { CheckWebsiteDto } from "./dto/website-monitoring.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CreateWebsiteDto } from "./dto/create-website.dto";
import { UpdateWebsiteDto } from "./dto/update-website.dto";

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

  @Post()
  @ApiBody({ type: CreateWebsiteDto })
  @ApiResponse({ status: 201, description: "Website criado com sucesso" })
  @ApiResponse({ status: 400, description: "Parâmetros inválidos" })
  @ApiResponse({ status: 500, description: "Erro no servidor" })
  async createWebsite(@Body() data: CreateWebsiteDto) {
    return this.websiteMonitoringService.createWebsite(data);
  }

  @Get(":id")
  @ApiResponse({ status: 200, description: "Detalhes do Website" })
  @ApiResponse({ status: 404, description: "Website não encontrado" })
  async findWebsiteById(@Param("id") id: string) {
    return this.websiteMonitoringService.findWebsiteById(id);
  }

  @Delete(":id")
  @ApiResponse({ status: 200, description: "Website deletado com sucesso" })
  @ApiResponse({ status: 404, description: "Website não encontrado" })
  async deleteWebsite(@Param("id") id: string) {
    return this.websiteMonitoringService.deleteWebsite(id);
  }

  @Patch(":id")
  @ApiBody({ type: UpdateWebsiteDto })
  @ApiResponse({ status: 200, description: "Website atualizado com sucesso" })
  @ApiResponse({ status: 400, description: "Parâmetros inválidos" })
  @ApiResponse({ status: 404, description: "Website não encontrado" })
  async updateWebsite(@Param("id") id: string, @Body() data: UpdateWebsiteDto) {
    return this.websiteMonitoringService.updateWebsite(id, data);
  }

  @Delete("routes/:routeId")
  async deleteRoute(@Param("routeId") routeId: string) {
    return this.websiteMonitoringService.deleteRoute(routeId);
  }

  @Post("update-status/:id")
  @ApiResponse({
    status: 200,
    description: "Status do site atualizado com sucesso",
  })
  @ApiResponse({ status: 404, description: "Site não encontrado" })
  async updateWebsiteStatus(@Param("id") id: string): Promise<void> {
    return this.websiteMonitoringService.updateWebsiteStatus(id);
  }

  @Get("user/:userId")
  @ApiQuery({ name: "page", required: true, type: Number, example: 1 })
  @ApiQuery({ name: "itemsPerPage", required: true, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Lista de Websites do usuário",
  })
  @ApiResponse({ status: 404, description: "Usuário não encontrado" })
  async findAllWebsitesByUserId(
    @Param("userId") userId: string,
    @Query("page") page: string,
    @Query("itemsPerPage") itemsPerPage: string,
    @Query("search") search?: string
  ) {
    return this.websiteMonitoringService.findAllWebsitesByUserId(
      userId,
      +page,
      +itemsPerPage,
      search
    );
  }
}

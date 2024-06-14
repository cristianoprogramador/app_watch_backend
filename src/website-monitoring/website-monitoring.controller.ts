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
  ApiOperation,
} from "@nestjs/swagger";
import { WebsiteMonitoringService } from "./website-monitoring.service";
import { WebsiteStatusDto } from "./dto/website-status.dto";
import { CheckWebsiteDto } from "./dto/website-monitoring.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CreateWebsiteDto } from "./dto/create-website.dto";
import { UpdateWebsiteDto } from "./dto/update-website.dto";
import { PaginatedWebsiteDto } from "./dto/paginated-website.dto";
import { PaginatedRouteDto } from "./dto/paginated-route.dto";

@ApiTags("Website Monitoring")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller("website-monitoring")
export class WebsiteMonitoringController {
  constructor(
    private readonly websiteMonitoringService: WebsiteMonitoringService
  ) {}

  @Get("check")
  @ApiOperation({ summary: "Check website status" })
  @ApiQuery({ name: "url", type: String, required: true })
  @ApiQuery({ name: "token", type: String, required: false })
  @ApiResponse({
    status: 200,
    description: "Website status",
    type: WebsiteStatusDto,
  })
  @ApiResponse({ status: 400, description: "Invalid parameters" })
  @ApiResponse({ status: 500, description: "Server error" })
  async checkWebsite(
    @Query() query: CheckWebsiteDto
  ): Promise<WebsiteStatusDto> {
    const { url, token } = query;
    return this.websiteMonitoringService.checkWebsite(url, token);
  }

  @Post()
  @ApiOperation({ summary: "Create a new website" })
  @ApiBody({ type: CreateWebsiteDto })
  @ApiResponse({ status: 201, description: "Website created successfully" })
  @ApiResponse({ status: 400, description: "Invalid parameters" })
  @ApiResponse({ status: 500, description: "Server error" })
  async createWebsite(@Body() data: CreateWebsiteDto) {
    return this.websiteMonitoringService.createWebsite(data);
  }

  @Get("listAllWebSites")
  @ApiOperation({ summary: "List all websites" })
  @ApiQuery({ name: "page", required: true, type: Number, example: 1 })
  @ApiQuery({ name: "itemsPerPage", required: true, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "List of websites found",
    type: PaginatedWebsiteDto,
  })
  findAllWebsites(
    @Query("page") page: string,
    @Query("itemsPerPage") itemsPerPage: string,
    @Query("search") search?: string
  ) {
    return this.websiteMonitoringService.findAllWebsites(
      +page,
      +itemsPerPage,
      search
    );
  }

  @Get("listAllRoutes")
  @ApiOperation({ summary: "List all routes" })
  @ApiQuery({ name: "page", required: true, type: Number, example: 1 })
  @ApiQuery({ name: "itemsPerPage", required: true, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "List of routes found",
    type: PaginatedRouteDto,
  })
  findAllRoutes(
    @Query("page") page: string,
    @Query("itemsPerPage") itemsPerPage: string,
    @Query("search") search?: string
  ) {
    return this.websiteMonitoringService.findAllRoutes(
      +page,
      +itemsPerPage,
      search
    );
  }

  @Get(":uuid")
  @ApiOperation({ summary: "Get website details by ID" })
  @ApiResponse({ status: 200, description: "Website details" })
  @ApiResponse({ status: 404, description: "Website not found" })
  async findWebsiteById(@Param("uuid") uuid: string) {
    return this.websiteMonitoringService.findWebsiteById(uuid);
  }

  @Delete(":uuid")
  @ApiOperation({ summary: "Delete a website by ID" })
  @ApiResponse({ status: 200, description: "Website deleted successfully" })
  @ApiResponse({ status: 404, description: "Website not found" })
  async deleteWebsite(@Param("uuid") uuid: string) {
    return this.websiteMonitoringService.deleteWebsite(uuid);
  }

  @Patch(":uuid")
  @ApiOperation({ summary: "Update website details by ID" })
  @ApiBody({ type: UpdateWebsiteDto })
  @ApiResponse({ status: 200, description: "Website updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid parameters" })
  @ApiResponse({ status: 404, description: "Website not found" })
  async updateWebsite(
    @Param("uuid") uuid: string,
    @Body() data: UpdateWebsiteDto
  ) {
    return this.websiteMonitoringService.updateWebsite(uuid, data);
  }

  @Delete("routes/:routeId")
  @ApiOperation({ summary: "Delete a route by ID" })
  @ApiResponse({ status: 200, description: "Route deleted successfully" })
  @ApiResponse({ status: 404, description: "Route not found" })
  async deleteRoute(@Param("routeId") routeId: string) {
    return this.websiteMonitoringService.deleteRoute(routeId);
  }

  @Post("update-status/:uuid")
  @ApiOperation({ summary: "Update website status by ID" })
  @ApiResponse({
    status: 200,
    description: "Website status updated successfully",
  })
  @ApiResponse({ status: 404, description: "Website not found" })
  async updateWebsiteStatus(@Param("uuid") uuid: string): Promise<void> {
    return this.websiteMonitoringService.updateWebsiteStatus(uuid);
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get all websites for a user" })
  @ApiQuery({ name: "page", required: true, type: Number, example: 1 })
  @ApiQuery({ name: "itemsPerPage", required: true, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "List of user's websites",
  })
  @ApiResponse({ status: 404, description: "User not found" })
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

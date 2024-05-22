import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ErrorLogsService } from "./error-logs.service";
import { Controller, Get, Param, Query } from "@nestjs/common";

// src/error-logs/error-logs.controller.ts
@ApiTags("ErrorLogs")
@Controller("errorLogs")
export class ErrorLogsController {
  constructor(private readonly errorLogsService: ErrorLogsService) {}

  @Get("list")
  @ApiQuery({ name: "page", required: true, type: Number, example: 1 })
  @ApiQuery({ name: "itemsPerPage", required: true, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String })
  findAll(
    @Query("page") page: string,
    @Query("itemsPerPage") itemsPerPage: string,
    @Query("search") search?: string
  ) {
    return this.errorLogsService.findAll(+page, +itemsPerPage, search);
  }

  @Get(":uuid")
  @ApiOperation({ summary: "Get ErrorLog By Id" })
  findOne(@Param("uuid") uuid: string) {
    return this.errorLogsService.findOne(uuid);
  }
}

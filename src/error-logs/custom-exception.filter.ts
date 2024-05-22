// src/error-logs/custom-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { ErrorLogsService } from "./error-logs.service";

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private errorLogsService: ErrorLogsService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log the error using the corrected method call
    await this.errorLogsService.logError(exception, host);

    response.status(status).json({
      statusCode: status,
      message:
        exception.response?.message ||
        exception.message ||
        "Unexpected error occurred",
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}

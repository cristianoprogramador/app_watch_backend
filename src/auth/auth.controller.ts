// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Get,
  Req,
  Logger,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { Request } from "express";

@ApiTags("Auth")
@ApiBearerAuth()
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post("register-new-client")
  @ApiOperation({ summary: "Register new client" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "User registered successfully.",
    type: RegisterDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request, e.g., email or document already exists.",
  })
  @ApiResponse({ status: 500, description: "Internal server error." })
  registerNewClient(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Login successful",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid credentials",
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get("verify-token")
  @ApiOperation({ summary: "Verify JWT token" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Token is valid",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid or expired token",
  })
  async verifyToken(@Req() request: Request) {
    const authHeader = request.headers["authorization"];
    const token = authHeader?.split(" ")[1] || "";
    // this.logger.log(`Authorization header: ${authHeader}`);
    // this.logger.log(`Token extracted: ${token}`);
    return this.authService.verifyToken(token);
  }
}

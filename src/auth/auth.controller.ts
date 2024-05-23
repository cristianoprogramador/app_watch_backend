// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
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
}
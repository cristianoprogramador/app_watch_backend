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
  ApiExcludeEndpoint,
} from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { RequestResetPasswordDto } from "./dto/request-reset-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { Lang } from "src/common/decorators/lang.decorator";

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
    status: HttpStatus.BAD_REQUEST,
    description: "Bad request, e.g., email or document already exists.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal server error.",
  })
  registerNewClient(@Body() registerDto: RegisterDto, @Lang() lang: string) {
    return this.authService.register(registerDto, lang);
  }

  @Post("login")
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Login successful",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid credentials",
  })
  async login(@Body() loginDto: LoginDto, @Lang() lang: string) {
    return this.authService.login(loginDto, lang);
  }

  @Post("google")
  @ApiExcludeEndpoint()
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.googleLogin(googleLoginDto);
  }

  @Get("verify-token")
  @ApiOperation({ summary: "Verify JWT token" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Token is valid",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid or expired token",
  })
  async verifyToken(@Req() request: Request, @Lang() lang: string) {
    const authHeader = request.headers["authorization"];
    const token = authHeader?.split(" ")[1] || "";
    return this.authService.verifyToken(token, lang);
  }

  @Post("request-reset-password")
  @ApiOperation({ summary: "Request password reset" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Password reset email sent",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Bad request",
  })
  async requestResetPassword(
    @Body() requestResetPasswordDto: RequestResetPasswordDto,
    @Lang() lang: string
  ) {
    return this.authService.requestResetPassword(
      requestResetPasswordDto.email,
      lang
    );
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Reset password" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Password reset successful",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Bad request",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid or expired token",
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Lang() lang: string
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
      lang
    );
  }
}

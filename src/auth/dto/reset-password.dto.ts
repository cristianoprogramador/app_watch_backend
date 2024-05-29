// src/auth/dto/reset-password.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({ example: "newPassword123" })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: "token-from-email" })
  @IsString()
  @IsNotEmpty()
  token: string;
}

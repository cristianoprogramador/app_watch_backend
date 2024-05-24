// src/auth/dto/reset-password.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  email: string;
}

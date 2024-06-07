// src/users/dto/update-user.dto.ts

import { ApiPropertyOptional } from "@nestjs/swagger";
import { UserType } from "@prisma/client";

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: "newuser@example.com",
    description: "New email address",
  })
  email?: string;

  @ApiPropertyOptional({
    example: "newSecurePassword!",
    description: "New password",
  })
  password?: string;

  @ApiPropertyOptional({
    enum: UserType,
    example: UserType.admin,
    description: "New user type",
  })
  type?: UserType;

  @ApiPropertyOptional({
    example: true,
    description: "Whether the user is disabled",
  })
  disabled?: boolean;
}

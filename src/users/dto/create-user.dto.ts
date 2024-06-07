// src/users/dto/create-user.dto.ts

import { ApiProperty } from "@nestjs/swagger";
import { UserType } from "@prisma/client";

export class CreateUserDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  email: string;

  @ApiProperty({ example: "securePassword!", description: "User password" })
  password: string;

  @ApiProperty({
    enum: UserType,
    example: UserType.client,
    description: "User type",
  })
  type: UserType;

  @ApiProperty({
    example: "optional-uuid",
    required: false,
    description: "UUID of user details",
  })
  userDetailsUuid?: string;
}

// src/auth/dto/register.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { PeopleDocumentType, UserType } from "@prisma/client";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  email: string;

  @ApiProperty({ example: "securePassword!" })
  password: string;

  @ApiProperty({ example: "John Doe" })
  name: string;

  @ApiProperty({ example: "client" })
  type: UserType;

  @ApiProperty({ example: "CPF" })
  typeDocument: PeopleDocumentType;

  @ApiProperty({ example: "12345678901" })
  document: string;
}

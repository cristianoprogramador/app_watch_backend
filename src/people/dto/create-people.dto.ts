// src/people/dto/create-people.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { PeopleDocumentType } from "@prisma/client";

export class CreatePeopleDto {
  @ApiProperty({ example: "John Doe", description: "Full name of the person" })
  readonly name: string;

  @ApiProperty({
    example: "john.doe@example.com",
    description: "Email address of the person",
    uniqueItems: true,
  })
  readonly email: string;

  @ApiProperty({
    example: "12345678901",
    description: "Document number of the person",
    required: false,
  })
  readonly document?: string;

  @ApiProperty({
    enum: PeopleDocumentType,
    description: "Type of document",
    required: false,
  })
  readonly typeDocument?: PeopleDocumentType;

  @ApiProperty({
    example: "https://example.com.br/image.jpg",
    description: "Image URL",
    required: false,
  })
  readonly profileImageUrl?: string;
}

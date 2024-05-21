import { ApiPropertyOptional } from "@nestjs/swagger";
import { PeopleDocumentType } from "@prisma/client";

export class UpdatePeopleDto {
  @ApiPropertyOptional({ description: "Name of the person" })
  name?: string;

  @ApiPropertyOptional({
    description: "Email address of the person",
    uniqueItems: true,
  })
  email?: string;

  @ApiPropertyOptional({ description: "Document number of the person" })
  document?: string;

  @ApiPropertyOptional({
    enum: PeopleDocumentType,
    description: "Type of document",
  })
  typeDocument?: PeopleDocumentType;
}

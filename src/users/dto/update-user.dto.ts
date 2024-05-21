import { ApiPropertyOptional } from "@nestjs/swagger";
import { UserType } from "@prisma/client";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "newuser@example.com" })
  email?: string;

  @ApiPropertyOptional()
  password?: string;

  @ApiPropertyOptional({ enum: UserType, example: UserType.admin })
  type?: UserType;

  @ApiPropertyOptional()
  disabled?: boolean;
}

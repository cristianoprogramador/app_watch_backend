import { ApiProperty } from "@nestjs/swagger";
import { UserType } from "@prisma/client";

export class CreateUserDto {
  @ApiProperty({ example: "user@example.com" })
  email: string;

  @ApiProperty({ example: "securePassword!" })
  password: string;

  @ApiProperty({ enum: UserType, example: UserType.client })
  type: UserType;

  @ApiProperty({ example: "optional-uuid", required: false })
  userDetailsUuid?: string;
}

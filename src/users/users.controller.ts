import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UuidValidationPipe } from "src/common/pipes/uuid-validation.pipe";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@ApiTags("Users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiExcludeEndpoint()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get("list")
  @ApiQuery({ name: "page", required: true, type: Number, example: 1 })
  @ApiQuery({ name: "itemsPerPage", required: true, type: Number, example: 10 })
  @ApiQuery({ name: "search", required: false, type: String })
  findAll(
    @Query("page") page: string,
    @Query("itemsPerPage") itemsPerPage: string,
    @Query("search") search?: string
  ) {
    return this.usersService.findAll(+page, +itemsPerPage, search);
  }

  @Get(":uuid")
  @ApiOperation({ summary: "Find a user by UUID" })
  @ApiParam({
    name: "uuid",
    type: String,
    description: "Unique identifier of the user",
  })
  @ApiResponse({
    status: 200,
    description: "User details returned successfully",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  findOne(@Param("uuid", UuidValidationPipe) uuid: string) {
    return this.usersService.findOne(uuid);
  }

  @Put(":uuid")
  @ApiOperation({ summary: "Update a user by UUID" })
  update(@Param("uuid") uuid: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(uuid, updateUserDto);
  }

  @Delete(":uuid")
  @ApiOperation({ summary: "Delete a user by UUID" })
  remove(@Param("uuid") uuid: string) {
    return this.usersService.remove(uuid);
  }
}

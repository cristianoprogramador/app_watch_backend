import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { UuidValidationPipe } from "src/common/pipes/uuid-validation.pipe";
import { UserDetailsService } from "./user-details.service";
import { CreateUserDetailsDto } from "./dto/create-user-details.dto";
import { UpdateUserDetailsDto } from "./dto/update-user-details.dto";

@ApiTags("UserDetails")
@Controller("userDetails")
export class UserDetailsController {
  constructor(private readonly userDetailsService: UserDetailsService) {}

  @Post()
  @ApiExcludeEndpoint()
  create(@Body() createUserDetailsDto: CreateUserDetailsDto) {
    return this.userDetailsService.create(createUserDetailsDto);
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
    return this.userDetailsService.findAll(+page, +itemsPerPage, search);
  }

  @Get(":uuid")
  @ApiOperation({ summary: "Find a user-details by UUID" })
  findOne(@Param("uuid", UuidValidationPipe) uuid: string) {
    return this.userDetailsService.findOne(uuid);
  }

  @Put(":uuid")
  @ApiOperation({ summary: "Update a person" })
  @ApiParam({
    name: "uuid",
    description: "Unique identifier of the person to update",
  })
  @ApiOkResponse({ description: "Person has been updated" })
  update(
    @Param("uuid") uuid: string,
    @Body() updateUserDetailsDto: UpdateUserDetailsDto
  ) {
    return this.userDetailsService.update(uuid, updateUserDetailsDto);
  }

  @Delete(":uuid")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a person by UUID" })
  @ApiParam({
    name: "uuid",
    required: true,
    description: "Unique identifier of the person to delete",
  })
  remove(@Param("uuid") uuid: string) {
    return this.userDetailsService.remove(uuid);
  }
}

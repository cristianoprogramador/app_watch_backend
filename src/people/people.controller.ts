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
import { PeopleService } from "./people.service";
import { CreatePeopleDto } from "./dto/create-people.dto";
import { UpdatePeopleDto } from "./dto/update-people.dto";
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { UuidValidationPipe } from "src/common/pipes/uuid-validation.pipe";

@ApiTags("Peoples")
@Controller("people")
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Post()
  @ApiExcludeEndpoint()
  create(@Body() createPeopleDto: CreatePeopleDto) {
    return this.peopleService.create(createPeopleDto);
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
    return this.peopleService.findAll(+page, +itemsPerPage, search);
  }

  @Get(":uuid")
  @ApiOperation({ summary: "Find a people by UUID" })
  findOne(@Param("uuid", UuidValidationPipe) uuid: string) {
    return this.peopleService.findOne(uuid);
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
    @Body() updatePeopleDto: UpdatePeopleDto
  ) {
    return this.peopleService.update(uuid, updatePeopleDto);
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
    return this.peopleService.remove(uuid);
  }
}

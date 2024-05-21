import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from "@nestjs/common";
import { PeopleService } from "./people.service";
import { CreatePeopleDto } from "./dto/create-people.dto";
import { UpdatePeopleDto } from "./dto/update-people.dto";

@Controller("people")
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Post()
  create(@Body() createPeopleDto: CreatePeopleDto) {
    return this.peopleService.create(createPeopleDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.peopleService.findOne(+id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updatePeopleDto: UpdatePeopleDto) {
    return this.peopleService.update(+id, updatePeopleDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.peopleService.remove(+id);
  }
}

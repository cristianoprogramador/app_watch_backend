import { Injectable } from "@nestjs/common";
import { CreatePeopleDto } from "./dto/create-people.dto";
import { UpdatePeopleDto } from "./dto/update-people.dto";

@Injectable()
export class PeopleService {
  create(createPeopleDto: CreatePeopleDto) {
    console.log(createPeopleDto);
    return "This action adds a new person";
  }

  findOne(id: number) {
    // Logic to find a person by ID
    return `This action returns a person #${id}`;
  }

  update(id: number, updatePeopleDto: UpdatePeopleDto) {
    console.log(updatePeopleDto);
    // Logic to update a person
    return `This action updates a person #${id}`;
  }

  remove(id: number) {
    // Logic to remove a person
    return `This action removes a person #${id}`;
  }
}

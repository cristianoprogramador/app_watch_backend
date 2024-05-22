import { Injectable } from "@nestjs/common";
import { CreatePeopleDto } from "./dto/create-people.dto";
import { UpdatePeopleDto } from "./dto/update-people.dto";
import { PeopleRepository } from "./people.repository";
import { PeopleDocumentType } from "@prisma/client";

export type CreatePeopleData = {
  name: string;
  email: string;
  document?: string;
  typeDocument?: PeopleDocumentType;
  profileImageUrl?: string;
};

@Injectable()
export class PeopleService {
  constructor(private readonly peopleRepository: PeopleRepository) {}

  async create(createPeopleDto: CreatePeopleDto) {
    const peopleData: CreatePeopleData = {
      name: createPeopleDto.name,
      email: createPeopleDto.email,
      document: createPeopleDto.document,
      typeDocument: createPeopleDto.typeDocument,
      profileImageUrl: createPeopleDto.profileImageUrl,
    };
    return await this.peopleRepository.create(peopleData);
  }

  async findOne(uuid: string) {
    return await this.peopleRepository.findOne(uuid);
  }

  async findAll(page: number, itemsPerPage: number, search?: string) {
    return await this.peopleRepository.findAll(page, itemsPerPage, search);
  }

  async update(uuid: string, updatePeopleDto: UpdatePeopleDto) {
    return await this.peopleRepository.update(uuid, updatePeopleDto);
  }

  async remove(uuid: string) {
    return await this.peopleRepository.remove(uuid);
  }
}

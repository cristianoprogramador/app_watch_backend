import { Injectable } from "@nestjs/common";

import { UserDetailsRepository } from "./user-details.repository";
import { PeopleDocumentType } from "@prisma/client";
import { CreateUserDetailsDto } from "./dto/create-user-details.dto";
import { UpdateUserDetailsDto } from "./dto/update-user-details.dto";

export type CreateUserDetailsData = {
  name: string;
  email: string;
  document?: string;
  typeDocument?: PeopleDocumentType;
  profileImageUrl?: string;
};

@Injectable()
export class UserDetailsService {
  constructor(private readonly userDetailsRepository: UserDetailsRepository) {}

  async create(createUserDetailsDto: CreateUserDetailsDto) {
    const userDetailsData: CreateUserDetailsData = {
      name: createUserDetailsDto.name,
      email: createUserDetailsDto.email,
      document: createUserDetailsDto.document,
      typeDocument: createUserDetailsDto.typeDocument,
      profileImageUrl: createUserDetailsDto.profileImageUrl,
    };
    return await this.userDetailsRepository.create(userDetailsData);
  }

  async findOne(uuid: string) {
    return await this.userDetailsRepository.findOne(uuid);
  }

  async findAll(page: number, itemsPerPage: number, search?: string) {
    return await this.userDetailsRepository.findAll(page, itemsPerPage, search);
  }

  async update(uuid: string, updateUserDetailsDto: UpdateUserDetailsDto) {
    return await this.userDetailsRepository.update(uuid, updateUserDetailsDto);
  }

  async remove(uuid: string) {
    return await this.userDetailsRepository.remove(uuid);
  }
}

import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    return this.usersRepository.create(createUserDto);
  }

  async findOne(uuid: string) {
    return this.usersRepository.findOne(uuid);
  }

  async findAll(page: number, itemsPerPage: number, search?: string) {
    return await this.usersRepository.findAll(page, itemsPerPage, search);
  }

  async update(uuid: string, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(uuid, updateUserDto);
  }

  async remove(uuid: string) {
    return this.usersRepository.remove(uuid);
  }
}

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersRepository } from "./users.repository";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private prisma: PrismaService
  ) {}

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

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException("User not found.");

    if (user.password !== password)
      throw new UnauthorizedException("Invalid credentials.");

    return user;
  }
}

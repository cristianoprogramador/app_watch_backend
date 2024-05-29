// src/users/users.repository.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    return this.prisma.user.create({ data });
  }

  async findAll(page: number, itemsPerPage: number, search?: string) {
    const skip = (page - 1) * itemsPerPage;
    const where = search
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }],
        }
      : {};

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: itemsPerPage,
      }),
    ]);

    return {
      total,
      users,
    };
  }

  async findOne(uuid: string) {
    return this.prisma.user.findUnique({
      where: { uuid },
    });
  }

  async update(uuid: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { uuid },
      data,
    });
  }

  async remove(uuid: string) {
    return this.prisma.user.delete({
      where: { uuid },
    });
  }
}

// src\user-details\user-details.repository.ts

import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/prisma/prisma.service";
import { UpdateUserDetailsDto } from "./dto/update-user-details.dto";
import { CreateUserDetailsData } from "./user-details.service";

@Injectable()
export class UserDetailsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDetailsData) {
    return this.prisma.userDetails.create({ data });
  }

  async findOne(uuid: string) {
    return this.prisma.userDetails.findUnique({
      where: { uuid },
    });
  }

  async findAll(page: number, itemsPerPage: number, search?: string) {
    const skip = (page - 1) * itemsPerPage;
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { document: { contains: search } },
          ],
        }
      : {};

    return this.prisma.userDetails.findMany({
      where,
      skip,
      take: itemsPerPage,
    });
  }

  async update(uuid: string, data: Partial<UpdateUserDetailsDto>) {
    return this.prisma.userDetails.update({
      where: { uuid },
      data,
    });
  }

  async remove(uuid: string) {
    return this.prisma.userDetails.delete({
      where: { uuid },
    });
  }
}

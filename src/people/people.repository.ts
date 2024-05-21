import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/prisma/prisma.service";
import { CreatePeopleData } from "./people.service";
import { UpdatePeopleDto } from "./dto/update-people.dto";

@Injectable()
export class PeopleRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePeopleData) {
    return this.prisma.people.create({ data });
  }

  async findOne(uuid: string) {
    return this.prisma.people.findUnique({
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

    return this.prisma.people.findMany({
      where,
      skip,
      take: itemsPerPage,
    });
  }

  async update(uuid: string, data: UpdatePeopleDto) {
    return this.prisma.people.update({
      where: { uuid },
      data,
    });
  }

  async remove(uuid: string) {
    return this.prisma.people.delete({
      where: { uuid },
    });
  }
}

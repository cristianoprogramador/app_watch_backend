import { Injectable } from "@nestjs/common";

import { People } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PeopleRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: People) {
    return this.prisma.people.create({ data });
  }

  async findOne(uuid: string) {
    return this.prisma.people.findUnique({
      where: { uuid },
    });
  }

  async update(uuid: string, data: People) {
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

// src/website-monitoring/website-monitoring.repository.ts
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class WebsiteMonitoringRepository {
  constructor(private prisma: PrismaService) {}

  async createWebsite(data: Prisma.WebsiteCreateInput) {
    return this.prisma.website.create({
      data,
      include: { routes: true },
    });
  }

  async findWebsiteById(id: string) {
    return this.prisma.website.findUnique({
      where: { uuid: id },
      include: { routes: true },
    });
  }

  async deleteWebsite(id: string) {
    return this.prisma.website.delete({
      where: { uuid: id },
    });
  }

  async findAllWebsites(): Promise<any[]> {
    return this.prisma.website.findMany({
      include: { routes: true },
    });
  }

  async findAllWebsitesByUserId(
    userId: string,
    page: number,
    itemsPerPage: number,
    search?: string
  ) {
    const skip = (page - 1) * itemsPerPage;
    const where: Prisma.WebsiteWhereInput = {
      userId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { url: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [total, websites] = await Promise.all([
      this.prisma.website.count({ where }),
      this.prisma.website.findMany({
        where,
        skip,
        take: itemsPerPage,
        include: { routes: true },
      }),
    ]);

    return {
      total,
      websites,
    };
  }
}

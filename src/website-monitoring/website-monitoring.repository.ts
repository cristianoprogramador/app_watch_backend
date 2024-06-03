// src/website-monitoring/website-monitoring.repository.ts
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateWebsiteDto } from "./dto/update-website.dto";

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
    const take = itemsPerPage;

    if (isNaN(skip) || isNaN(take)) {
      throw new Error("Invalid pagination parameters");
    }

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
        take,
        include: { routes: true, siteStatus: true },
      }),
    ]);

    return {
      total,
      websites,
    };
  }

  async updateSiteStatus(siteId: string, status: string): Promise<void> {
    await this.prisma.siteStatus.upsert({
      where: { siteId },
      update: {
        status: status,
        lastChecked: new Date(),
      },
      create: {
        siteId: siteId,
        status: status,
        lastChecked: new Date(),
      },
    });
  }

  async updateWebsite(uuid: string, data: UpdateWebsiteDto): Promise<any> {
    const { routes, ...updateData } = data;

    const existingRoutes = routes.filter((route) => route.uuid);
    const newRoutes = routes.filter((route) => !route.uuid);

    const updateOps = existingRoutes.map((route) => ({
      where: { uuid: route.uuid },
      update: {
        method: route.method,
        route: route.route,
        body: route.body || undefined,
      },
      create: {
        method: route.method,
        route: route.route,
        body: route.body || undefined,
      },
    }));

    return this.prisma.website.update({
      where: { uuid },
      data: {
        ...updateData,
        ...(routes && {
          routes: {
            upsert: updateOps,
            create: newRoutes.map((route) => ({
              method: route.method,
              route: route.route,
              body: route.body || undefined,
            })),
          },
        }),
      },
      include: { routes: true, siteStatus: true },
    });
  }

  async createSiteStatus(data: {
    siteId: string;
    status: string;
    lastChecked: Date;
  }) {
    return this.prisma.siteStatus.create({
      data: {
        siteId: data.siteId,
        status: data.status,
        lastChecked: data.lastChecked,
      },
    });
  }

  async deleteRoute(routeId: string): Promise<void> {
    await this.prisma.route.delete({
      where: { uuid: routeId },
    });
  }
}

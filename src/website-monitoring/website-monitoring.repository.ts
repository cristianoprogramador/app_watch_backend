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
      include: {
        routes: {
          include: {
            website: true,
          },
        },
        siteStatus: true,
      },
    });
  }

  async findAllWebsitesWithPagination(
    page: number,
    itemsPerPage: number,
    search?: string
  ) {
    const skip = (page - 1) * itemsPerPage;
    const where: Prisma.WebsiteWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { url: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [total, websites] = await Promise.all([
      this.prisma.website.count({ where }),
      this.prisma.website.findMany({
        where,
        skip,
        take: itemsPerPage,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { email: true },
          },
          routes: true,
        },
      }),
    ]);

    const websitesWithRouteCount = websites.map((website) => ({
      ...website,
      routeCount: website.routes.length,
    }));

    return {
      total,
      websites: websitesWithRouteCount,
    };
  }

  async findAllRoutesWithPagination(
    page: number,
    itemsPerPage: number,
    search?: string
  ) {
    const skip = (page - 1) * itemsPerPage;
    const where: Prisma.RouteWhereInput = search
      ? {
          route: { contains: search, mode: "insensitive" },
        }
      : {};

    const [total, routes] = await Promise.all([
      this.prisma.route.count({ where }),
      this.prisma.route.findMany({
        where,
        skip,
        take: itemsPerPage,
        orderBy: { createdAt: "desc" },
        include: {
          website: {
            include: {
              user: {
                select: { email: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      total,
      routes: routes.map((route) => ({
        ...route,
        websiteName: route.website.name,
        userEmail: route.website.user.email,
      })),
    };
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
        include: {
          routes: {
            include: {
              routeStatus: true,
            },
          },
          siteStatus: true,
        },
      }),
    ]);

    const transformedWebsites = websites.map((website) => ({
      ...website,
      routes: website.routes.map((route) => ({
        ...route,
        status: route.routeStatus?.status || "unknown",
        response: route.routeStatus?.response || "",
      })),
    }));

    return {
      total,
      websites: transformedWebsites,
    };
  }

  async updateSiteStatus(siteId: string, status: string): Promise<void> {
    await this.prisma.siteCheck.upsert({
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

  async createOrUpdateRouteStatus(data: {
    routeId: string;
    status: string;
    response?: string;
  }): Promise<void> {
    await this.prisma.routeCheck.upsert({
      where: { routeId: data.routeId },
      update: {
        status: data.status,
        response: data.response,
        checkedAt: new Date(),
      },
      create: {
        routeId: data.routeId,
        status: data.status,
        response: data.response,
        checkedAt: new Date(),
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
    return this.prisma.siteCheck.create({
      data: {
        siteId: data.siteId,
        status: data.status,
        lastChecked: data.lastChecked,
      },
    });
  }

  async createRouteStatus(data: {
    routeId: string;
    status: string;
    response?: string;
  }): Promise<void> {
    await this.prisma.routeCheck.create({
      data: {
        routeId: data.routeId,
        status: data.status,
        response: data.response,
        checkedAt: new Date(),
      },
    });
  }

  async deleteRoute(routeId: string): Promise<void> {
    await this.prisma.routeCheck.deleteMany({
      where: { routeId },
    });

    await this.prisma.route.delete({
      where: { uuid: routeId },
    });
  }

  async countUserSites(userId: string): Promise<number> {
    return this.prisma.website.count({
      where: {
        userId: userId,
      },
    });
  }

  async recordEmailSent(email: string, websiteName: string) {
    await this.prisma.emailLog.create({
      data: {
        email,
        websiteName,
        sentAt: new Date(),
      },
    });
  }

  async findLastEmailSent(email: string, websiteName: string) {
    return this.prisma.emailLog.findFirst({
      where: {
        email,
        websiteName,
      },
      orderBy: {
        sentAt: "desc",
      },
    });
  }
}

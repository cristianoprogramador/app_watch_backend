// src/website-monitoring/website-monitoring.service.ts
import { Injectable } from "@nestjs/common";
import { WebsiteStatusDto } from "./dto/website-status.dto";
import { WebsiteMonitoringRepository } from "./website-monitoring.repository";
import { CreateWebsiteDto } from "./dto/create-website.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class WebsiteMonitoringService {
  constructor(private repository: WebsiteMonitoringRepository) {}

  async checkWebsite(url: string, token?: string): Promise<WebsiteStatusDto> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(url, { headers });

      return { status: response.ok ? "online" : "offline" };
    } catch (error) {
      return { status: "offline" };
    }
  }

  async createWebsite(data: CreateWebsiteDto) {
    const websiteData: Prisma.WebsiteCreateInput = {
      name: data.siteName,
      url: data.siteUrl,
      token: data.token,
      user: {
        connect: { uuid: data.userId },
      },
      routes: {
        create: data.routes.map((route) => ({
          method: route.method,
          path: route.route,
          body: route.body,
        })),
      },
    };
    return this.repository.createWebsite(websiteData);
  }

  async findWebsiteById(id: string) {
    return this.repository.findWebsiteById(id);
  }

  async deleteWebsite(id: string) {
    return this.repository.deleteWebsite(id);
  }

  async findAllWebsitesByUserId(
    userId: string,
    page: number,
    itemsPerPage: number,
    search?: string
  ) {
    return this.repository.findAllWebsitesByUserId(
      userId,
      page,
      itemsPerPage,
      search
    );
  }
}

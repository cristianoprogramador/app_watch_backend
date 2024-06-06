// src\website-monitoring\website-monitoring.service.ts

import { Injectable, Logger } from "@nestjs/common";
import { WebsiteStatusDto } from "./dto/website-status.dto";
import { WebsiteMonitoringRepository } from "./website-monitoring.repository";
import { CreateWebsiteDto } from "./dto/create-website.dto";
import { HttpMethod } from "./dto/create-route.dto";
import { Cron, CronExpression } from "@nestjs/schedule";
import { WebsiteMonitoringGateway } from "./website-monitoring.gateway";
import { UpdateWebsiteDto } from "./dto/update-website.dto";
import { PrismaService } from "src/prisma/prisma.service";
import axios from "axios";

@Injectable()
export class WebsiteMonitoringService {
  private readonly logger = new Logger(WebsiteMonitoringService.name);

  constructor(
    private repository: WebsiteMonitoringRepository,
    private gateway: WebsiteMonitoringGateway,
    private prisma: PrismaService
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkAllWebsites(): Promise<void> {
    this.logger.debug("Checking all websites and routes");
    const websites = await this.repository.findAllWebsites();
    for (const website of websites) {
      const siteStatus = await this.checkWebsite(website.url, website.token);
      await this.repository.updateSiteStatus(website.uuid, siteStatus.status);

      const routesStatus = [];
      for (const route of website.routes) {
        const routeStatus = await this.checkRoute(route, website.token);
        await this.repository.createOrUpdateRouteStatus({
          routeId: route.uuid,
          status: routeStatus.status,
          response: routeStatus.response,
        });
        routesStatus.push({
          routeId: route.uuid,
          route: route.route,
          status: routeStatus.status,
          response: routeStatus.response,
        });
      }

      this.gateway.sendStatusUpdate(website.userId, {
        siteUuid: website.uuid,
        name: website.name,
        status: siteStatus.status,
        routes: routesStatus,
      });
    }
  }

  async checkWebsite(url: string, token?: string): Promise<WebsiteStatusDto> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(url, { headers });

      return { status: response.ok ? "online" : "offline" };
    } catch (error) {
      return { status: "offline" };
    }
  }

  async checkRoute(
    route,
    token?: string
  ): Promise<{ status: string; response: string }> {
    try {
      const baseUrl = route.website.url.endsWith("/")
        ? route.website.url.slice(0, -1)
        : route.website.url;

      const routePath = route.route.startsWith("/")
        ? route.route
        : `/${route.route}`;

      const fullUrl = `${baseUrl}${routePath}`;

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios({
        method: route.method,
        url: fullUrl,
        data: route.body ? JSON.parse(route.body) : undefined,
        headers,
      });

      return { status: "success", response: JSON.stringify(response.data) };
    } catch (error) {
      console.error("Error checking route:", error);
      return { status: "failure", response: error.message };
    }
  }

  async deleteRoute(routeId: string): Promise<void> {
    return this.repository.deleteRoute(routeId);
  }

  async createWebsite(data: CreateWebsiteDto) {
    const website = await this.repository.createWebsite({
      name: data.name,
      url: data.url,
      token: data.token,
      user: { connect: { uuid: data.userId } },
      routes: {
        create: data.routes.map((route) => ({
          method: route.method as HttpMethod,
          route: route.route,
          body: route.body,
        })),
      },
    });

    const initialStatus = await this.checkWebsite(data.url, data.token);

    await this.repository.createSiteStatus({
      siteId: website.uuid,
      status: initialStatus.status,
      lastChecked: new Date(),
    });

    this.gateway.sendStatusUpdate(data.userId, {
      siteUuid: website.uuid,
      status: initialStatus.status,
    });

    return website;
  }

  async findWebsiteById(id: string) {
    return this.repository.findWebsiteById(id);
  }

  async deleteWebsite(id: string) {
    const website = await this.findWebsiteById(id);
    if (!website) {
      throw new Error(`Site com ID ${id} não encontrado`);
    }

    await this.prisma.siteStatus.deleteMany({
      where: { siteId: website.uuid },
    });

    for (const route of website.routes) {
      await this.deleteRoute(route.uuid);
    }

    return this.repository.deleteWebsite(id);
  }

  async updateWebsite(id: string, data: UpdateWebsiteDto): Promise<any> {
    const website = await this.repository.updateWebsite(id, data);
    if (website) {
      this.gateway.sendStatusUpdate(website.userId, {
        siteUuid: website.uuid,
        name: website.name,
        status: website.siteStatus.status,
      });
    }
    return website;
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

  async updateWebsiteStatus(siteId: string): Promise<void> {
    const website = await this.repository.findWebsiteById(siteId);
    if (!website) {
      throw new Error(`Site com ID ${siteId} não encontrado`);
    }

    const siteStatus = await this.checkWebsite(website.url, website.token);
    await this.repository.updateSiteStatus(website.uuid, siteStatus.status);

    const routesStatus = [];
    for (const route of website.routes) {
      const routeStatus = await this.checkRoute(
        { ...route, website },
        website.token
      );
      await this.repository.createOrUpdateRouteStatus({
        routeId: route.uuid,
        status: routeStatus.status,
        response: routeStatus.response,
      });
      routesStatus.push({
        routeId: route.uuid,
        route: route.route,
        status: routeStatus.status,
        response: routeStatus.response,
      });
    }

    this.gateway.sendStatusUpdate(website.userId, {
      siteUuid: website.uuid,
      name: website.name,
      status: siteStatus.status,
      routes: routesStatus,
    });
  }
}

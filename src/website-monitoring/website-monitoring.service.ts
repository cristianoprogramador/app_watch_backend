// src\website-monitoring\website-monitoring.service.ts

import { Injectable, Logger } from "@nestjs/common";
import { WebsiteStatusDto } from "./dto/website-status.dto";
import { WebsiteMonitoringRepository } from "./website-monitoring.repository";
import { CreateWebsiteDto } from "./dto/create-website.dto";
import { HttpMethod } from "./dto/create-route.dto";
import { Cron, CronExpression } from "@nestjs/schedule";
import { WebsiteMonitoringGateway } from "./website-monitoring.gateway";
import { UpdateWebsiteDto } from "./dto/update-website.dto";

@Injectable()
export class WebsiteMonitoringService {
  private readonly logger = new Logger(WebsiteMonitoringService.name);

  constructor(
    private repository: WebsiteMonitoringRepository,
    private gateway: WebsiteMonitoringGateway
  ) {}

  // @Cron(CronExpression.EVERY_10_SECONDS)
  @Cron(CronExpression.EVERY_MINUTE)
  async checkAllWebsites(): Promise<void> {
    this.logger.debug("Checking all websites");
    const websites = await this.repository.findAllWebsites();
    for (const website of websites) {
      const status = await this.checkWebsite(website.url, website.token);
      await this.repository.updateSiteStatus(website.uuid, status.status);
      this.gateway.sendStatusUpdate(website.userId, {
        siteUuid: website.uuid,
        name: website.name,
        status: status.status,
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
}

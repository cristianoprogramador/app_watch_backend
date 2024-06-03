import { Injectable, Logger } from "@nestjs/common";
import { WebsiteStatusDto } from "./dto/website-status.dto";
import { WebsiteMonitoringRepository } from "./website-monitoring.repository";
import { CreateWebsiteDto } from "./dto/create-website.dto";
import { Prisma } from "@prisma/client";
import { Cron, CronExpression } from "@nestjs/schedule";
import { WebsiteMonitoringGateway } from "./website-monitoring.gateway";

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

  async createWebsite(data: CreateWebsiteDto) {
    const websiteData: Prisma.WebsiteCreateInput = {
      name: data.siteName,
      url: data.siteUrl,
      token: data.token,
      user: {
        connect: { uuid: data.userId },
      },
      routes: data.routes?.length
        ? {
            create: data.routes.map((route) => ({
              method: route.method,
              path: route.route,
              body: route.body,
            })),
          }
        : undefined,
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
